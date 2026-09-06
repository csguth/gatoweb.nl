// clientsApp() Alpine component for the standalone Clients page
// (layouts/facturen/clients/list.html, issue #173 follow-up). Lígia
// pre-registers an existing client's info here and mints a native Supabase
// invite link for them on demand — see supabase/functions/client-invite and
// the `clients` table in supabase/schema.sql. Sorting/filtering/pagination
// decisions live in the pure ./client-list.js module (covered by
// tests/bdd/features/client-list.feature) — this file only wires them to
// Supabase + the page's reactive state.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { filterClients, sortClients, paginate } from './client-list.js';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const t = (key, options) => window.t(key, options);

const PAGE_SIZE = 10;

// Same storageKey as facturen.html ('gatoweb-facturen-auth') so Lígia stays
// logged in when navigating between /facturen/ and /facturen/clients/ —
// this page is just as staff-only, so it must never be confused with a
// client's own session (see 'gatoweb-client-auth' in account-app.js).
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'gatoweb-facturen-auth'
  }
}) : null;

window.clientsApp = function () {
  return {
    configured,
    session: null,
    email: '',
    password: '',
    loginError: '',
    loading: false,

    clients: [],
    loadingClients: false,
    search: '',
    statusFilter: 'all',
    sortField: 'created_at',
    sortDir: 'desc',
    page: 1,
    clientForm: null,

    get filteredSortedClients() {
      const filtered = filterClients(this.clients, { search: this.search.trim(), status: this.statusFilter });
      return sortClients(filtered, this.sortField, this.sortDir);
    },

    get pagedResult() {
      return paginate(this.filteredSortedClients, this.page, PAGE_SIZE);
    },

    async init() {
      if (!configured) return;
      const { data } = await supabase.auth.getSession();
      if (data.session && await this.checkStaffAccess(data.session)) {
        this.session = data.session;
      }
      supabase.auth.onAuthStateChange((_event, session) => {
        // Only ever set this.session after a fresh staff check — otherwise a
        // non-staff account could slip in through a token refresh event.
        if (!session) this.session = null;
      });
      if (this.session) this.loadClients();
    },

    // Same is_staff() re-check facturen-app.js does right after login/session
    // restore — see checkStaffAccess() there for the full rationale.
    async checkStaffAccess(session) {
      const { data: staff, error } = await supabase.rpc('is_staff');
      if (error || !staff) {
        await supabase.auth.signOut();
        this.session = null;
        this.loginError = t('not_staff_error');
        return false;
      }
      return true;
    },

    async login() {
      this.loading = true;
      this.loginError = '';
      const { data, error } = await supabase.auth.signInWithPassword({ email: this.email, password: this.password });
      if (error) { this.loading = false; this.loginError = error.message; return; }
      const isStaff = await this.checkStaffAccess(data.session);
      this.loading = false;
      if (!isStaff) return;
      this.session = data.session;
      this.password = '';
      this.loadClients();
    },

    async logout() {
      await supabase.auth.signOut();
      this.session = null;
      this.clients = [];
    },

    async loadClients() {
      this.loadingClients = true;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      this.loadingClients = false;
      if (error) { alert(error.message); return; }
      this.clients = (data || []).map(c => ({ ...c, _inviteLink: '', _inviteBusy: false }));
    },

    // Sorting/pagination interplay: changing the sort column keeps the
    // current page number, but any change to search/status text resets back
    // to page 1 via the resetPage() calls wired in the template (x-on:input
    // / x-on:change) so a narrower filter never leaves the user stranded on
    // a now-empty page.
    setSort(field) {
      if (this.sortField === field) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDir = 'asc';
      }
    },

    sortIndicator(field) {
      if (this.sortField !== field) return '';
      return this.sortDir === 'asc' ? '▲' : '▼';
    },

    resetPage() {
      this.page = 1;
    },

    nextPage() {
      if (this.page < this.pagedResult.totalPages) this.page += 1;
    },

    prevPage() {
      if (this.page > 1) this.page -= 1;
    },

    openClientForm() {
      this.clientForm = { name: '', email: '', phone: '', address: '', preferred_lang: 'en', error: '', busy: false };
    },

    closeClientForm() {
      this.clientForm = null;
    },

    async saveNewClient() {
      const form = this.clientForm;
      if (!form) return;
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      if (!name) { form.error = t('clients.name_required'); return; }
      if (!email) { form.error = t('clients.email_required'); return; }

      form.busy = true;
      form.error = '';
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name,
          email,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          preferred_lang: form.preferred_lang,
          created_by: this.session.user.id
        })
        .select()
        .single();
      form.busy = false;
      if (error) { form.error = error.message; return; }

      this.clients = [{ ...data, _inviteLink: '', _inviteBusy: false }, ...this.clients];
      this.clientForm = null;
    },

    // Calls the client-invite Edge Function to mint a fresh Supabase invite
    // link (no email is ever sent — see index.ts) right before Lígia sends
    // it, so it never sits around long enough to expire before being used.
    async generateInviteLink(c) {
      c._inviteBusy = true;
      c._inviteLink = '';
      try {
        const { data, error } = await supabase.functions.invoke('client-invite', {
          body: { email: c.email, lang: c.preferred_lang }
        });
        if (error) throw error;
        if (!data || !data.link) throw new Error(t('clients.invite_error'));
        c._inviteLink = data.link;
        await supabase.from('clients').update({ invited_at: new Date().toISOString() }).eq('id', c.id);
        c.invited_at = c.invited_at || new Date().toISOString();
      } catch (err) {
        alert(await this.describeInviteError(err));
      } finally {
        c._inviteBusy = false;
      }
    },

    // supabase-js's FunctionsHttpError only carries a generic "Edge Function
    // returned a non-2xx status code" in err.message — the actual { error }
    // body our Edge Function sent back (e.g. "A valid email is required")
    // is on err.context, a Response object that must be read separately.
    async describeInviteError(err) {
      if (err && err.context && typeof err.context.json === 'function') {
        try {
          const body = await err.context.json();
          if (body && body.error) return body.error;
        } catch {
          // context wasn't JSON — fall through to the generic message below.
        }
      }
      return (err && err.message) || t('clients.invite_error');
    },

    async copyInviteLink(c) {
      if (!c._inviteLink) return;
      await navigator.clipboard.writeText(c._inviteLink);
      alert(t('clients.link_copied'));
    },

    // Same wa.me pattern as facturen-app.js's whatsappLink(b), pre-filled
    // with the freshly generated invite link instead of a booking
    // confirmation message.
    inviteWhatsappLink(c) {
      if (!c._inviteLink || !c.phone) return '#';
      const digits = String(c.phone).replace(/\D/g, '');
      if (!digits) return '#';
      const message = t('clients.invite_message', { name: c.name, link: c._inviteLink });
      return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
    }
  };
};
