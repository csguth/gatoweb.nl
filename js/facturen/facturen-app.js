// facturenApp() Alpine component for facturen.html (Ligia's staff-only invoicing tool).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildInvoiceLineItems } from './invoice-calc.js';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const BUSINESS_LEGAL_NAME = window.GATOWEB_CONFIG.BUSINESS_LEGAL_NAME;
const BUSINESS_ADDRESS = window.GATOWEB_CONFIG.BUSINESS_ADDRESS;
const KVK_NUMBER = window.GATOWEB_CONFIG.KVK_NUMBER;
const IBAN_NUMBER = window.GATOWEB_CONFIG.IBAN_NUMBER;
const BTW_EXEMPT = window.GATOWEB_CONFIG.BTW_EXEMPT;
const PRICE_ONE_VISIT = Number(window.GATOWEB_CONFIG.PRICE_ONE_VISIT) || 0;
const PRICE_TWO_VISITS = Number(window.GATOWEB_CONFIG.PRICE_TWO_VISITS) || 0;
const DOG_WALK_PRICE_FROM = Number(window.GATOWEB_CONFIG.DOG_WALK_PRICE_FROM) || 0;
const SEASONAL_SURCHARGE_PERCENT = Number(window.GATOWEB_CONFIG.SEASONAL_SURCHARGE_PERCENT) || 0;

const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const t = (key, options) => window.t(key, options);

// The invoice itself is always in Dutch (issue #32), regardless of which language
// Ligia currently has the dashboard set to — getFixedT('nl') looks up the 'nl' bundle
// directly instead of the currently active i18next language. All three locale bundles
// are already loaded by js/i18n.js's init(), so this works even when the UI is in en/pt.
function tNl(key, options) {
  if (window.i18next && window.i18next.isInitialized) {
    return window.i18next.getFixedT('nl')(key, options);
  }
  return key;
}

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

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Turns one structured line item (from invoice-calc.js) into the Dutch sentence shown
// on the invoice, e.g. "Catsitting 's avonds — 2026-07-01 t/m 2026-07-02, 2x per dag".
// Seasonal surcharges (item.type === 'surcharge') get their own separate line, so the
// extra cost is explicit rather than folded into a higher unit price (issue #32 follow-up).
function lineItemDescription(item) {
  const service = tNl('invoice.line.service_' + item.service);
  const period = tNl('invoice.line.period_' + item.period);
  const frequency = tNl('invoice.line.frequency_' + item.visitsPerDay);
  const dateRange = item.from === item.to
    ? tNl('invoice.line.date_range_single', { date: item.from })
    : tNl('invoice.line.date_range_multi', { from: item.from, to: item.to });
  const base = (service + ' ' + period).trim() + ' — ' + dateRange + ', ' + frequency;
  if (item.type === 'surcharge') {
    return tNl('invoice.line.surcharge_item', { percent: item.percent, description: base });
  }
  return base;
}

// Builds a standalone, self-contained HTML document for the invoice — always in Dutch,
// laid out for A4 — so Ligia can print it (or "Save as PDF") straight from the browser's
// own print dialog. This avoids adding a PDF-generation library: @media print + @page
// is all standard CSS, supported by every modern browser.
function buildInvoiceDocumentHtml(b) {
  const numberLabel = factuurNumberLabel(b.factuur_number, b.approved_at);
  const dateLabel = new Date(b.approved_at || Date.now()).toLocaleDateString('nl-NL');
  const { items, total } = buildInvoiceLineItems(b, {
    priceOneVisit: PRICE_ONE_VISIT,
    priceTwoVisits: PRICE_TWO_VISITS,
    dogWalkPriceFrom: DOG_WALK_PRICE_FROM,
    seasonalSurchargePercent: SEASONAL_SURCHARGE_PERCENT
  });
  // Prefer the invoiced total Ligia actually confirmed (final_amount) when it's set,
  // since she can still hand-adjust it before approving; fall back to the calculated
  // total otherwise (e.g. for older bookings without a final_amount).
  const displayTotal = b.final_amount != null ? Number(b.final_amount) : total;
  const hasHighSeasonItem = items.some(function (item) { return item.season === 'high'; });

  const rows = items.map(function (item) {
    return '<tr>' +
      '<td>' + escapeHtml(lineItemDescription(item)) + '</td>' +
      '<td class="num">' + item.dayCount + '</td>' +
      '<td class="num">€ ' + item.unitPrice.toFixed(2) + '</td>' +
      '<td class="num">€ ' + item.subtotal.toFixed(2) + '</td>' +
      '</tr>';
  }).join('');

  const businessName = escapeHtml(BUSINESS_LEGAL_NAME || window.GATOWEB_CONFIG.BRAND_NAME);
  const title = escapeHtml(tNl('invoice.title', { number: numberLabel }));

  return '<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8">' +
    '<title>' + title + '</title>' +
    '<style>' +
    '@page { size: A4; margin: 20mm; }' +
    'body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; color: #222; max-width: 170mm; margin: 0 auto; }' +
    'h1 { font-size: 16pt; margin: 0 0 4mm; }' +
    '.business { font-size: 9pt; color: #555; margin-bottom: 8mm; }' +
    '.meta, .recipient { margin-bottom: 6mm; }' +
    '.meta div, .recipient div { margin-bottom: 1mm; }' +
    'table { width: 100%; border-collapse: collapse; margin: 6mm 0; }' +
    'th, td { text-align: left; padding: 2mm 1mm; border-bottom: 1px solid #ddd; font-size: 10pt; }' +
    'th.num, td.num { text-align: right; white-space: nowrap; }' +
    '.total-row td { border-top: 2px solid #333; border-bottom: none; font-weight: bold; font-size: 12pt; padding-top: 3mm; }' +
    '.notes { font-size: 8.5pt; color: #555; margin-top: 8mm; line-height: 1.5; }' +
    '.no-print { margin-bottom: 8mm; }' +
    '@media print { .no-print { display: none; } }' +
    '</style></head><body>' +
    '<div class="no-print"><button onclick="window.print()">' + escapeHtml(tNl('invoice.print_button')) + '</button></div>' +
    '<div class="business">' + businessName +
      (BUSINESS_ADDRESS ? '<br>' + escapeHtml(BUSINESS_ADDRESS) : '') +
      (KVK_NUMBER ? '<br>KVK: ' + escapeHtml(KVK_NUMBER) : '') +
    '</div>' +
    '<h1>' + title + '</h1>' +
    '<div class="meta">' +
      '<div>' + escapeHtml(tNl('invoice.date_label', { date: dateLabel })) + '</div>' +
    '</div>' +
    '<div class="recipient">' +
      '<div><strong>' + escapeHtml(tNl('invoice.recipient_label')) + '</strong></div>' +
      '<div>' + escapeHtml(tNl('invoice.client_label', { client: b.client_name || '-' })) + '</div>' +
      (b.client_address ? '<div>' + escapeHtml(tNl('invoice.address_label', { address: b.client_address })) + '</div>' : '') +
    '</div>' +
    '<table><thead><tr>' +
      '<th>' + escapeHtml(tNl('invoice.table.description')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.days')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.unit_price')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.subtotal')) + '</th>' +
    '</tr></thead><tbody>' + rows +
      '<tr class="total-row"><td colspan="3">' + escapeHtml(tNl('invoice.table.subtotal')) + '</td>' +
      '<td class="num">€ ' + displayTotal.toFixed(2) + '</td></tr>' +
    '</tbody></table>' +
    '<div class="notes">' +
      (hasHighSeasonItem ? '<div>' + escapeHtml(tNl('invoice.seasonal_note', { percent: SEASONAL_SURCHARGE_PERCENT })) + '</div>' : '') +
      (BTW_EXEMPT === 'true' ? '<div>' + escapeHtml(tNl('invoice.vat_exempt_kor')) + '</div>' : '') +
      (IBAN_NUMBER ? '<div>' + escapeHtml(tNl('invoice.payment_tikkie_iban', { iban: IBAN_NUMBER })) + '</div>' : '') +
    '</div>' +
    '</body></html>';
}

// Opens the invoice in a new tab as a standalone printable A4 document — Ligia uses the
// browser's own "Print" / "Save as PDF" from there. Replaces the old jsPDF-based
// generatePdf() (issue #32): no extra library, and a real A4-styled layout instead of
// loose text lines.
function openInvoicePrintWindow(b) {
  const html = buildInvoiceDocumentHtml(b);
  const win = window.open('', '_blank');
  if (!win) {
    alert(t('invoice.popup_blocked'));
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
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

    printInvoice(b) {
      openInvoicePrintWindow(b);
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
      const confirmMsg = t('invoice.confirm_approve', {
        client: b.client_name || t('invoice.this_client')
      });
      if (!confirm(confirmMsg)) return;
      b._busy = true;

      if (b.client_name || b.client_address) {
        await supabase.from('bookings').update({ client_name: b.client_name, client_address: b.client_address, client_contact: b.client_contact }).eq('id', b.id);
      }

      const { data, error } = await supabase.rpc('approve_booking', {
        p_booking_id: b.id,
        p_final_amount: b.final_amount
      });

      b._busy = false;
      if (error) { alert(error.message); return; }

      const approved = Array.isArray(data) ? data[0] : data;
      const merged = { ...b, ...approved, client_name: b.client_name, client_address: b.client_address, client_contact: b.client_contact, tikkie_sent: false, _busy: false };
      const idx = this.bookings.findIndex(x => x.id === b.id);
      if (idx !== -1) this.bookings.splice(idx, 1, merged);
      this.bookings = sortBookings(this.bookings);
      openInvoicePrintWindow(merged);
    },

    // Builds the wa.me link Lígia uses to message the client directly (issue #39),
    // pre-filled with a confirmation message. Returns '#' when there's no phone
    // number saved so the button (hidden via x-show) never navigates anywhere.
    whatsappLink(b) {
      if (!b.client_contact) return '#';
      const digits = String(b.client_contact).replace(/\D/g, '');
      if (!digits) return '#';
      const message = b.client_name
        ? tNl('invoice.whatsapp_message', { name: b.client_name, dates: b.date_from + (b.date_to ? ' \u2192 ' + b.date_to : '') })
        : tNl('invoice.whatsapp_message_generic', { dates: b.date_from + (b.date_to ? ' \u2192 ' + b.date_to : '') });
      return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
    }
  };
};
