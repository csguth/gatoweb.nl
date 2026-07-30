// Shared invoice document generator (issue #62). Builds the standalone, A4-printable
// invoice HTML from a booking, reused by both the staff tool (js/facturen/facturen-app.js)
// and the client self-service portal (js/account/account-app.js) so the document a client
// sees is byte-for-byte the same one Ligia prints — same line items, same total.
//
// The invoice itself is always in Dutch (issue #32), regardless of which language the UI
// is currently set to. It relies on window.GATOWEB_CONFIG (pricing + business info) and
// window.i18next (all three locale bundles loaded by js/i18n.js), both of which are present
// on facturen.html and account.html.
import { buildInvoiceLineItems } from '../facturen/invoice-calc.js';

function cfg() {
  return window.GATOWEB_CONFIG || {};
}

// Looks up the 'nl' bundle directly instead of the active i18next language, so the printed
// invoice stays Dutch even when the surrounding page is in en/pt.
function tNl(key, options) {
  if (window.i18next && window.i18next.isInitialized) {
    return window.i18next.getFixedT('nl')(key, options);
  }
  return key;
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function factuurNumberLabel(n, referenceDate) {
  const year = new Date(referenceDate || Date.now()).getFullYear();
  return year + '-' + String(n).padStart(4, '0');
}

function rates() {
  const c = cfg();
  return {
    priceOneVisit: Number(c.PRICE_ONE_VISIT) || 0,
    priceTwoVisits: Number(c.PRICE_TWO_VISITS) || 0,
    dogWalkPriceFrom: Number(c.DOG_WALK_PRICE_FROM) || 0,
    seasonalSurchargePercent: Number(c.SEASONAL_SURCHARGE_PERCENT) || 0,
    extraCatPricePerDay: Number(c.PRICE_EXTRA_CAT_PER_DAY) || 0
  };
}

// Turns one structured line item (from invoice-calc.js) into the Dutch sentence shown
// on the invoice, e.g. "Catsitting 's avonds — 2026-07-01 t/m 2026-07-02, 2x per dag".
// Seasonal surcharges (item.type === 'surcharge') get their own separate line.
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
  if (item.type === 'extra-cat') {
    return tNl('invoice.line.extra_cat_item', { count: item.extraCatCount, description: base });
  }
  return base;
}

// Builds a standalone, self-contained HTML document for the invoice — always in Dutch,
// laid out for A4 — so it can be printed (or "Save as PDF") straight from the browser's
// own print dialog. No PDF library needed: @media print + @page is all standard CSS.
export function buildInvoiceDocumentHtml(b) {
  const c = cfg();
  const SEASONAL_SURCHARGE_PERCENT = Number(c.SEASONAL_SURCHARGE_PERCENT) || 0;
  const BUSINESS_LEGAL_NAME = c.BUSINESS_LEGAL_NAME;
  const BUSINESS_ADDRESS = c.BUSINESS_ADDRESS;
  const KVK_NUMBER = c.KVK_NUMBER;
  const IBAN_NUMBER = c.IBAN_NUMBER;
  const BTW_EXEMPT = c.BTW_EXEMPT;

  const numberLabel = factuurNumberLabel(b.factuur_number, b.approved_at || b.paid_at);
  const dateLabel = new Date(b.paid_at || b.approved_at || Date.now()).toLocaleDateString('nl-NL');
  const { items, total } = buildInvoiceLineItems(b, rates());
  const adjustment = Number(b.adjustment_amount || 0);
  // final_amount is always calculated total + adjustment (set atomically by the
  // approve_booking() RPC — issue #52) — never a free-typed number, so it can never
  // silently diverge from the line items shown below.
  const displayTotal = b.final_amount != null ? Number(b.final_amount) : total + adjustment;
  const hasHighSeasonItem = items.some(function (item) { return item.season === 'high'; });

  // Issue #62: a booking has no factuur_number until its Tikkie is marked paid. Before then
  // this document is a *proforma* — same figures, but explicitly not a fiscal invoice and
  // without an official (sequence-consuming) number.
  const isProforma = b.factuur_number == null;
  const title = isProforma
    ? escapeHtml(tNl('invoice.proforma_title'))
    : escapeHtml(tNl('invoice.title', { number: numberLabel }));

  const rows = items.map(function (item) {
    return '<tr>' +
      '<td>' + escapeHtml(lineItemDescription(item)) + '</td>' +
      '<td class="num">' + item.dayCount + '</td>' +
      '<td class="num">€ ' + item.unitPrice.toFixed(2) + '</td>' +
      '<td class="num">€ ' + item.subtotal.toFixed(2) + '</td>' +
      '</tr>';
  }).join('');

  const adjustmentRow = adjustment !== 0
    ? '<tr>' +
        '<td colspan="3">' + escapeHtml(tNl('invoice.line.adjustment', { note: b.adjustment_note || '' })) + '</td>' +
        '<td class="num">€ ' + adjustment.toFixed(2) + '</td>' +
      '</tr>'
    : '';

  const businessName = escapeHtml(BUSINESS_LEGAL_NAME || c.BRAND_NAME);

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
    '.proforma-notice { border: 1px solid #d9a441; background: #fdf6e9; color: #8a5a00; ' +
      'padding: 3mm 4mm; border-radius: 2mm; font-size: 9.5pt; margin-bottom: 6mm; }' +
    '.no-print { margin-bottom: 8mm; }' +
    '@media print { .no-print { display: none; } }' +
    '</style></head><body>' +
    '<div class="no-print"><button onclick="window.print()">' + escapeHtml(tNl('invoice.print_button')) + '</button></div>' +
    '<div class="business">' + businessName +
      (BUSINESS_ADDRESS ? '<br>' + escapeHtml(BUSINESS_ADDRESS) : '') +
      (KVK_NUMBER ? '<br>KVK: ' + escapeHtml(KVK_NUMBER) : '') +
    '</div>' +
    '<h1>' + title + '</h1>' +
    (isProforma ? '<div class="proforma-notice">' + escapeHtml(tNl('invoice.proforma_notice')) + '</div>' : '') +
    '<div class="meta">' +
      '<div>' + escapeHtml(tNl('invoice.date_label', { date: dateLabel })) + '</div>' +
    '</div>' +
    '<div class="recipient">' +
      '<div><strong>' + escapeHtml(tNl('invoice.recipient_label')) + '</strong></div>' +
      '<div>' + escapeHtml(tNl('invoice.client_label', { client: b.client_name || '-' })) + '</div>' +
      (b.client_address ? '<div>' + escapeHtml(tNl('invoice.address_label', { address: b.client_address })) + '</div>' : '') +
      (b.client_contact ? '<div>' + escapeHtml(tNl('invoice.contact_label', { contact: b.client_contact })) + '</div>' : '') +
    '</div>' +
    '<table><thead><tr>' +
      '<th>' + escapeHtml(tNl('invoice.table.description')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.days')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.unit_price')) + '</th>' +
      '<th class="num">' + escapeHtml(tNl('invoice.table.subtotal')) + '</th>' +
    '</tr></thead><tbody>' + rows + adjustmentRow +
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

// Opens the invoice in a new tab as a standalone printable A4 document — the browser's own
// "Print" / "Save as PDF" is used from there. Shows a translated alert (in the active UI
// language) if the pop-up is blocked.
export function openInvoicePrintWindow(b) {
  const html = buildInvoiceDocumentHtml(b);
  const win = window.open('', '_blank');
  if (!win) {
    if (typeof window.t === 'function') alert(window.t('invoice.popup_blocked'));
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
