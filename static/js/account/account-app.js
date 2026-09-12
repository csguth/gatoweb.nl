// accountApp() Alpine component for account.html (client self-service booking portal, issue #12).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { openInvoicePrintWindow } from '../shared/invoice-document.js';
import { formatDateDDMMYYYY } from '../shared/format-date.js';
import { petsSummary } from '../shared/pets-summary.js';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const t = (key, options) => window.t(key, options);

// Same storageKey as index.html's client auth ('gatoweb-client-auth') so a client who
// logged in from the booking form on / stays logged in here, and vice versa. Kept
// separate from facturen.html's own 'gatoweb-facturen-auth' key (staff-only tool),
// so a client session here can never be confused with Ligia's staff session.
// detectSessionInUrl is true here (unlike facturen.html) because clients land here after
// clicking the email-confirmation link, which appends the session tokens as a URL fragment
// that supabase-js needs to pick up automatically to log them in.
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'gatoweb-client-auth'
  }
}) : null;

function petsText(pets) {
  return petsSummary(pets);
}

function factuurNumberLabel(n, referenceDate) {
  const year = new Date(referenceDate || Date.now()).getFullYear();
  return year + '-' + String(n).padStart(4, '0');
}

function priorityOf(b) {
  if (b.status === 'pending') return 0;
  if (b.status === 'approved' && !b.tikkie_sent) return 1;
  if (b.status === 'approved' && b.tikkie_sent) return 2;
  return 3;
}

function sortBookings(list) {
  return list.slice().sort((a, b) => {
    const pa = priorityOf(a), pb = priorityOf(b);
    if (pa !== pb) return pa - pb;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

window.accountApp = function () {
  return {
    configured,
    session: null,
    mode: 'login',
    email: '',
    password: '',
    errorMsg: '',
    infoMsg: '',
    loading: false,
    loadingList: false,
    bookings: [],

    // Issue #179: a client landing here via Lígia's invite link
    // (/invite/?invite=<token>) is greeted by name (from get_invite_preview())
    // and signs up themselves (own email + password) instead of "just set a
    // password" — the token carries no email, unlike the old Supabase-native
    // invite link it replaces. Once they have a session, claim_client_invite()
    // links their brand new Account to the pre-registered Profile.
    inviteToken: null,
    inviteClientName: '',
    inviteError: '',
    linkedBookingsCount: null,
    profile: null,
    // Set when claim_client_invite() fails during afterLogin() — e.g. the
    // token got claimed or expired in the gap between the invite preview and
    // finishing signup (a race, not something the preview check can catch).
    // The Account itself is still created/logged in fine at this point; only
    // the Profile link failed, so this is a banner on the bookings view, not
    // a blocking form error.
    claimError: '',

    async init() {
      if (!configured) return;
      const params = new URLSearchParams(window.location.search);
      const token = params.get('invite');
      if (token) {
        this.inviteToken = token;
        await this.loadInvitePreview();
      }

      const { data } = await supabase.auth.getSession();
      this.session = data.session;
      supabase.auth.onAuthStateChange((_event, session) => { this.session = session; });
      if (this.session) await this.afterLogin();
    },

    async loadInvitePreview() {
      const { data, error } = await supabase.rpc('get_invite_preview', { p_token: this.inviteToken });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row || !row.client_name) {
        this.inviteError = t('auth.invite_invalid_or_expired');
        this.inviteToken = null;
        return;
      }
      this.inviteClientName = row.client_name;
      // Issue #179: an invite link is exclusively for creating a brand new
      // account (the client never had one) — default straight into the
      // dedicated signup form (layouts/account/list.html hides the
      // login/signup toggle whenever inviteClientName is set).
      this.mode = 'signup';
    },

    // Runs once, right after a session is available (fresh login/signup, or
    // one already restored on page load). If we landed here via a still
    // unclaimed invite token, claim it first — this both links the Profile
    // and (as before) links any pre-existing bookings by email — before
    // loading the profile card + bookings list.
    async afterLogin() {
      if (this.inviteToken) {
        const { data: linkedCount, error } = await supabase.rpc('claim_client_invite', { p_token: this.inviteToken });
        if (error) {
          // The Account was created/logged in fine — only the Profile link
          // failed (e.g. someone else claimed this token in the meantime,
          // or it expired between the preview and finishing signup). Don't
          // fail silently: the client would otherwise land on an empty
          // bookings page with no clue why their profile is missing.
          this.claimError = t('auth.invite_claim_failed');
        } else {
          this.linkedBookingsCount = typeof linkedCount === 'number' ? linkedCount : null;
        }
        this.inviteToken = null;
      }
      await this.loadProfile();
      await this.loadBookings();
    },

    // Reads the client's own Profile, if their Account is linked to one —
    // RLS ("linked account can select own profile" in schema.sql) means this
    // simply returns nothing for a client who signed up without ever being
    // invited, no special-casing needed here.
    async loadProfile() {
      const { data, error } = await supabase.from('clients').select('*').maybeSingle();
      if (!error) this.profile = data || null;
    },


    async login() {
      this.loading = true;
      this.errorMsg = '';
      this.infoMsg = '';
      const { data, error } = await supabase.auth.signInWithPassword({ email: this.email, password: this.password });
      this.loading = false;
      if (error) { this.errorMsg = error.message; return; }
      this.session = data.session;
      this.password = '';
      await this.afterLogin();
    },

    async signup() {
      this.loading = true;
      this.errorMsg = '';
      this.infoMsg = '';
      // Without emailRedirectTo the confirmation link's redirect_to falls back to the
      // Supabase project's "Site URL" (often localhost); pin it to the live origin the
      // client actually signed up on so the link returns to gatoweb.nl (or staging).
      // Issue #179: the invite token (if any) is appended as a query param so it
      // survives the email-confirmation round trip and afterLogin() can still
      // claim it once the client comes back with a session.
      let redirectTo = window.location.origin + window.location.pathname;
      if (this.inviteToken) redirectTo += '?invite=' + encodeURIComponent(this.inviteToken);
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: { emailRedirectTo: redirectTo }
      });
      this.loading = false;
      if (error) { this.errorMsg = error.message; return; }
      if (!data.session) {
        this.infoMsg = t('auth.account_created_check_email_login');
        this.mode = 'login';
        this.password = '';
        return;
      }
      this.session = data.session;
      await this.afterLogin();
    },

    async logout() {
      await supabase.auth.signOut();
      this.session = null;
      this.bookings = [];
      this.profile = null;
    },

    async loadBookings() {
      this.loadingList = true;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      this.loadingList = false;
      if (error) { this.errorMsg = error.message; return; }
      this.bookings = sortBookings(data || []);
    },

    petsSummary(pets) {
      return petsText(pets);
    },

    // Formats a stay's DD/MM/YYYY date range for display (issue #78) — bookings
    // store date_from/date_to as raw 'YYYY-MM-DD' strings.
    formatDate(dateStr) {
      return formatDateDDMMYYYY(dateStr);
    },

    factuurLabel(b) {
      return factuurNumberLabel(b.factuur_number, b.approved_at);
    },

    // Whether the client can open the invoice document for this booking. Any non-cancelled
    // booking can be viewed (issue #62): while it's still awaiting confirmation (pending) or
    // approved-but-unpaid it's a proforma (no factuur_number), and once paid it becomes the
    // official numbered factuur — the same document generator handles all cases, computing
    // line items straight from the booking (dates/pets/preference) + config rates. Cancelled
    // bookings never show the button. RLS (supabase/schema.sql) guarantees the client only
    // ever receives their own rows.
    canViewInvoice(b) {
      return b.status === 'pending' || b.status === 'approved';
    },

    viewInvoice(b) {
      openInvoicePrintWindow(b);
    }
  };
};
