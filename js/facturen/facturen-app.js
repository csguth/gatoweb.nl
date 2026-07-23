// facturenApp() Alpine component for facturen.html (Ligia's staff-only invoicing tool).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const BUSINESS_LEGAL_NAME = window.GATOWEB_CONFIG.BUSINESS_LEGAL_NAME;
const BUSINESS_ADDRESS = window.GATOWEB_CONFIG.BUSINESS_ADDRESS;
const KVK_NUMBER = window.GATOWEB_CONFIG.KVK_NUMBER;
const IBAN_NUMBER = window.GATOWEB_CONFIG.IBAN_NUMBER;
const BTW_EXEMPT = window.GATOWEB_CONFIG.BTW_EXEMPT;

const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Session persistence: this is a static site with no server, so there's no way to
// set an httpOnly cookie — Supabase's own localStorage-backed session is the standard,
// supported approach here. We keep the session in its own storage key (not shared with
// any other app on this origin), let the SDK auto-refresh the access token, and never
// render booking data into raw HTML (only Alpine's text bindings), which keeps XSS-based
// token theft very unlikely. Data exposure is further bounded by the RLS policies in
// supabase/schema.sql (only the authenticated user can read/write bookings).
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'gatoweb-facturen-auth'
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

// Priority order for the list: things Ligia still needs to act on come first —
// 0) pending bookings waiting for approval, 1) approved invoices whose Tikkie
// payment request still needs to be created/sent, 2) approved+Tikkie-sent
// (done, informational only), 3) cancelled (informational only).
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
    return new Date(a.created_at) - new Date(b.created_at);
  });
}

function generatePdf(b) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text(BUSINESS_LEGAL_NAME || window.GATOWEB_CONFIG.BRAND_NAME, 20, y); y += 8;
  doc.setFontSize(10);
  if (BUSINESS_ADDRESS) { doc.text(BUSINESS_ADDRESS, 20, y); y += 5; }
  if (KVK_NUMBER) { doc.text('KVK: ' + KVK_NUMBER, 20, y); y += 5; }
  y += 5;

  doc.setFontSize(14);
  doc.text('Factuur ' + factuurNumberLabel(b.factuur_number, b.approved_at), 20, y); y += 8;
  doc.setFontSize(10);
  doc.text('Datum: ' + new Date(b.approved_at || Date.now()).toLocaleDateString('nl-NL'), 20, y); y += 10;

  doc.text('Klant: ' + (b.client_name || '-'), 20, y); y += 10;

  doc.text('Omschrijving:', 20, y); y += 6;
  doc.text('Catsitting/oppasdiensten ' + b.date_from + (b.date_to ? ' t/m ' + b.date_to : ''), 20, y); y += 6;
  doc.text('Huisdieren: ' + petsText(b.pets), 20, y); y += 6;
  if (b.preference) { doc.text('Voorkeur: ' + b.preference, 20, y); y += 6; }
  y += 6;

  doc.setFontSize(12);
  doc.text('Totaal: € ' + Number(b.final_amount).toFixed(2), 20, y); y += 10;

  doc.setFontSize(9);
  if (BTW_EXEMPT === 'true') {
    doc.text('Vrijgesteld van BTW op grond van de kleineondernemersregeling (KOR).', 20, y); y += 6;
  }
  if (IBAN_NUMBER) { doc.text('Betaling: via Tikkie (apart verzonden) — IBAN ' + IBAN_NUMBER, 20, y); y += 6; }

  doc.save('factuur-' + factuurNumberLabel(b.factuur_number, b.approved_at) + '.pdf');
}

window.facturenApp = function () {
  return {
    configured,
    session: null,
    email: '',
    password: '',
    loginError: '',
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
      this.loginError = '';
      const { data, error } = await supabase.auth.signInWithPassword({ email: this.email, password: this.password });
      this.loading = false;
      if (error) { this.loginError = error.message; return; }
      this.session = data.session;
      this.password = '';
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
        .order('created_at', { ascending: true });
      this.loadingList = false;
      if (error) { alert(error.message); return; }
      this.bookings = sortBookings((data || []).map(b => ({ ...b, final_amount: b.final_amount ?? b.suggested_amount ?? 0, _busy: false })));
    },

    petsSummary(pets) {
      return petsText(pets);
    },

    factuurLabel(b) {
      return factuurNumberLabel(b.factuur_number, b.approved_at);
    },

    downloadPdf(b) {
      generatePdf(b);
    },

    async markTikkieSent(b) {
      b._busy = true;
      const { error } = await supabase.from('bookings').update({ tikkie_sent: true }).eq('id', b.id);
      b._busy = false;
      if (error) { alert(error.message); return; }
      b.tikkie_sent = true;
      this.bookings = sortBookings(this.bookings);
    },

    async approve(b) {
      const isNl = document.body.classList.contains('show-nl');
      const confirmMsg = isNl
        ? 'Factuur definitief goedkeuren voor ' + (b.client_name || 'deze klant') + '?'
        : 'Permanently approve the invoice for ' + (b.client_name || 'this client') + '?';
      if (!confirm(confirmMsg)) return;
      b._busy = true;

      if (b.client_name) {
        await supabase.from('bookings').update({ client_name: b.client_name }).eq('id', b.id);
      }

      const { data, error } = await supabase.rpc('approve_booking', {
        p_booking_id: b.id,
        p_final_amount: b.final_amount
      });

      b._busy = false;
      if (error) { alert(error.message); return; }

      const approved = Array.isArray(data) ? data[0] : data;
      const merged = { ...b, ...approved, client_name: b.client_name, tikkie_sent: false, _busy: false };
      const idx = this.bookings.findIndex(x => x.id === b.id);
      if (idx !== -1) this.bookings.splice(idx, 1, merged);
      this.bookings = sortBookings(this.bookings);
      generatePdf(merged);
    }
  };
};
