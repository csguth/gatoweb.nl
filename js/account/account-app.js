// accountApp() Alpine component for account.html (client self-service booking portal, issue #12).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { openInvoicePrintWindow } from '../shared/invoice-document.js';

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
  if (!Array.isArray(pets)) return '-';
  return pets.map(p => (p.name ? p.name + ' (' + (p.otherType || p.type) + ')' : (p.otherType || p.type))).join(', ');
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

    async init() {
      if (!configured) return;
      const { data } = await supabase.auth.getSession();
      this.session = data.session;
      supabase.auth.onAuthStateChange((_event, session) => { this.session = session; });
      if (this.session) this.loadBookings();
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
      this.loadBookings();
    },

    async signup() {
      this.loading = true;
      this.errorMsg = '';
      this.infoMsg = '';
      // Without emailRedirectTo the confirmation link's redirect_to falls back to the
      // Supabase project's "Site URL" (often localhost); pin it to the live origin the
      // client actually signed up on so the link returns to gatoweb.nl (or staging).
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
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
      this.loadBookings();
    },

    async logout() {
      await supabase.auth.signOut();
      this.session = null;
      this.bookings = [];
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
