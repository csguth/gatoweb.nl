// clientsApp() Alpine component for the standalone Clients page
// (layouts/clients/list.html, issue #173, redesigned in #179). Lígia
// pre-registers an existing client's Profile (name, pets, phone, address —
// no email) here and mints a generic invite token for it on demand — see
// the `clients`/`client_invites`/`account_profile_links` tables and the
// create_client_invite()/claim_client_invite() RPCs in supabase/schema.sql.
// Sorting/filtering/pagination/status-derivation decisions live in the pure
// ./client-list.js module (covered by tests/bdd/features/client-list.feature)
// — this file only wires them to Supabase + the page's reactive state.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { filterClients, sortClients, paginate, deriveClientRoster } from './client-list.js';
import { generateInviteLink, sendPasswordReset, unlinkAccount } from './client-invite-actions.js';
import { petsSummary } from '../shared/pets-summary.js';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const t = (key, options) => window.t(key, options);

const PAGE_SIZE = 10;

// Same storageKey as facturen.html ('gatoweb-facturen-auth') so Lígia stays
// logged in when navigating between /facturen/ and /clients/ —
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

    // Issue #179: a Profile row no longer carries invited_at/accepted_at —
    // those are derived client-side from the separate client_invites/
    // account_profile_links tables via deriveClientRoster() (client-list.js)
    // so the rest of this page (search/filter/sort/pagination, the roster
    // table) keeps working exactly as before.
    async loadClients() {
      this.loadingClients = true;
      const [clientsRes, invitesRes, linksRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('client_invites').select('client_id, created_at'),
        supabase.from('account_profile_links').select('client_id, linked_at')
      ]);
      this.loadingClients = false;
      const error = clientsRes.error || invitesRes.error || linksRes.error;
      if (error) { alert(error.message); return; }
      const roster = deriveClientRoster(clientsRes.data || [], invitesRes.data || [], linksRes.data || []);
      this.clients = roster.map(c => ({ ...c, _inviteLink: '', _inviteBusy: false }));
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

    // Issue #179: no email field here anymore — a Profile only needs a
    // name (pets/phone/address optional) to be registered. Email now only
    // ever exists on the linked Account (auth.users), chosen by the client
    // themselves when they follow the invite link.
    openClientForm() {
      this.clientForm = {
        name: '',
        phone: '',
        address: '',
        preferred_lang: 'en',
        pets: [{ name: '', type: 'cat', otherType: '' }],
        error: '',
        busy: false
      };
    },

    closeClientForm() {
      this.clientForm = null;
    },

    addPet() {
      this.clientForm.pets.push({ name: '', type: 'cat', otherType: '' });
    },

    removePet(i) {
      this.clientForm.pets.splice(i, 1);
    },

    petsSummary(pets) {
      return petsSummary(pets);
    },

    async saveNewClient() {
      const form = this.clientForm;
      if (!form) return;
      const name = form.name.trim();
      if (!name) { form.error = t('clients.name_required'); return; }

      form.busy = true;
      form.error = '';
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          preferred_lang: form.preferred_lang,
          pets: form.pets.filter(p => p.name.trim() || p.type !== 'cat' || p.otherType.trim()),
          created_by: this.session.user.id
        })
        .select()
        .single();
      form.busy = false;
      if (error) { form.error = error.message; return; }

      this.clients = [{ ...data, invited_at: null, accepted_at: null, _inviteLink: '', _inviteBusy: false }, ...this.clients];
      this.clientForm = null;
    },

    // Issue #179: mints a fresh, generic invite token via create_client_invite()
    // (no email involved, no Edge Function call) and builds the link Lígia
    // copies/sends herself — see client-invite-link.js. All the RPC/error
    // decision logic lives in client-invite-actions.js (issue #180 follow-up)
    // so it's independently BDD-testable without a real Supabase client.
    async generateInviteLink(c) {
      c._inviteBusy = true;
      c._inviteLink = '';
      const result = await generateInviteLink({
        rpc: (name, args) => supabase.rpc(name, args),
        clientId: c.id,
        origin: window.location.origin,
        lang: c.preferred_lang,
        genericErrorMessage: t('clients.invite_error')
      });
      c._inviteBusy = false;
      if (!result.ok) { alert(result.message); return; }
      c._inviteLink = result.link;
      c.invited_at = c.invited_at || new Date().toISOString();
    },

    // Issue #179 follow-up: once a client's Account is linked (c.accepted_at
    // set), "Generate invite link" no longer applies — offer a standard
    // "forgot password" email instead, via Supabase's own recovery flow.
    // get_linked_account_email() (schema.sql) is the only place the linked
    // Account's real email is ever read, since Profiles never store one.
    async sendPasswordReset(c) {
      c._inviteBusy = true;
      const result = await sendPasswordReset({
        rpc: (name, args) => supabase.rpc(name, args),
        resetPasswordForEmail: (email, opts) => supabase.auth.resetPasswordForEmail(email, opts),
        clientId: c.id,
        origin: window.location.origin,
        lang: c.preferred_lang,
        genericErrorMessage: t('clients.invite_error')
      });
      c._inviteBusy = false;
      if (!result.ok) { alert(result.message); return; }
      alert(t('clients.password_reset_sent'));
    },

    // Issue #179 follow-up: undoes a wrong/unwanted link (e.g. the client
    // claimed the wrong invite, or wants to switch to a different email) —
    // unlink_client_account() (schema.sql) only removes the link row, so the
    // Profile reverts to its pre-invite state and a fresh invite can be
    // minted for it. Destructive enough (the client loses access to their
    // profile/bookings until re-invited) to warrant a confirm() prompt.
    async unlinkAccount(c) {
      if (!window.confirm(t('clients.unlink_confirm', { name: c.name }))) return;
      c._inviteBusy = true;
      const result = await unlinkAccount({ rpc: (name, args) => supabase.rpc(name, args), clientId: c.id });
      c._inviteBusy = false;
      if (!result.ok) { alert(result.message); return; }
      c.accepted_at = null;
      alert(t('clients.unlink_success'));
    },

    async copyInviteLink(c) {
      if (!c._inviteLink) return;
      await navigator.clipboard.writeText(c._inviteLink);
      alert(t('clients.link_copied'));
    }
  };
};
