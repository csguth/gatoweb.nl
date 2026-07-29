// facturenApp() Alpine component for facturen.html (Ligia's staff-only invoicing tool).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildInvoiceLineItems } from './invoice-calc.js';
import { openInvoicePrintWindow } from '../shared/invoice-document.js';
import { isValidPaymentUrl } from './payment-url.js';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const PRICE_ONE_VISIT = Number(window.GATOWEB_CONFIG.PRICE_ONE_VISIT) || 0;
const PRICE_TWO_VISITS = Number(window.GATOWEB_CONFIG.PRICE_TWO_VISITS) || 0;
const DOG_WALK_PRICE_FROM = Number(window.GATOWEB_CONFIG.DOG_WALK_PRICE_FROM) || 0;
const SEASONAL_SURCHARGE_PERCENT = Number(window.GATOWEB_CONFIG.SEASONAL_SURCHARGE_PERCENT) || 0;

const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const t = (key, options) => window.t(key, options);

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

// Kanban board columns: pending (inbox) → confirmed (send Tikkie) → done
// (Tikkie sent, or cancelled). Each column is sorted independently.

// Inbox: bookings still awaiting approval, oldest first.
function sortInbox(list) {
  return list.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

// Calendar order (by stay start date) for the confirmed/done columns.
function sortByDate(list) {
  return list.slice().sort((a, b) => new Date(a.date_from) - new Date(b.date_from));
}

function matchesSearch(b, term) {
  if (!term) return true;
  const haystack = [
    b.client_name,
    b.client_email,
    b.client_address,
    b.client_contact,
    petsText(b.pets),
    b.preference
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(term);
}

// Issue #52: the invoice total must always be traceable back to the booking's actual
// line items — this bundles the pricing config once so invoiceItems()/calculatedTotal()
// (used by the dashboard) and buildInvoiceLineItems() (used by the printed invoice) are
// always computed from the exact same numbers.
function rates() {
  return {
    priceOneVisit: PRICE_ONE_VISIT,
    priceTwoVisits: PRICE_TWO_VISITS,
    dogWalkPriceFrom: DOG_WALK_PRICE_FROM,
    seasonalSurchargePercent: SEASONAL_SURCHARGE_PERCENT
  };
}

// Short on-screen summary for one invoice line item, in whatever language the dashboard
// is currently set to (as opposed to the always-Dutch lineItemDescription() in
// js/shared/invoice-document.js used for the printed invoice).
function itemSummary(item) {
  const service = t('invoice.line.service_' + item.service);
  const period = t('invoice.line.period_' + item.period);
  const frequency = t('invoice.line.frequency_' + item.visitsPerDay);
  const dateRange = item.from === item.to
    ? t('invoice.line.date_range_single', { date: item.from })
    : t('invoice.line.date_range_multi', { from: item.from, to: item.to });
  const base = (service + ' ' + period).trim() + ' — ' + dateRange + ', ' + frequency;
  if (item.type === 'surcharge') {
    return t('invoice.line.surcharge_item', { percent: item.percent, description: base });
  }
  return base;
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
    search: '',
    clientEdit: null,

    get inboxBookings() {
      const term = this.search.trim().toLowerCase();
      return sortInbox(this.bookings.filter(b => b.status === 'pending' && matchesSearch(b, term)));
    },

    // "Confirmed" column: approved bookings that don't have an official factuur_number yet
    // (i.e. the Tikkie hasn't been marked paid). This covers both "Tikkie not sent yet" and
    // "sent, awaiting payment" — the card itself shows the right action for each (issue #62).
    get confirmedBookings() {
      const term = this.search.trim().toLowerCase();
      return sortByDate(this.bookings.filter(b => b.status === 'approved' && b.factuur_number == null && matchesSearch(b, term)));
    },

    // "Done" column: paid bookings (they now have a real factuur_number) and cancelled ones.
    get doneBookings() {
      const term = this.search.trim().toLowerCase();
      return sortByDate(this.bookings.filter(b => (b.status === 'cancelled' || (b.status === 'approved' && b.factuur_number != null)) && matchesSearch(b, term)));
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
      if (this.session) this.loadBookings();
    },

    // Issue #52 follow-up: facturen.html is staff-only, but until now ANY authenticated
    // Supabase user (e.g. a regular client account) could log in and see the dashboard
    // shell — only individual actions (approve, edit client info) failed later with a
    // cryptic "not authorized" error from the RPCs. This checks is_staff() right after
    // login (and on session restore) and immediately signs the user back out if they
    // aren't on the staff_emails allow-list, so non-staff accounts never see the board.
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
      // _adjustmentAmount/_adjustmentNote are dashboard-only draft fields for a pending
      // booking's approval (issue #52) — they seed from any previously-saved adjustment
      // so re-opening a booking doesn't lose it, but are never sent anywhere until approve().
      this.bookings = (data || []).map(b => ({
        ...b,
        final_amount: b.final_amount ?? b.suggested_amount ?? 0,
        _adjustmentAmount: Number(b.adjustment_amount || 0),
        _adjustmentNote: b.adjustment_note || '',
        _busy: false
      }));
    },

    petsSummary(pets) {
      return petsText(pets);
    },

    factuurLabel(b) {
      return factuurNumberLabel(b.factuur_number, b.approved_at);
    },

    // Issue #52: the invoice line items are always derived from the booking's actual
    // dates/pets/preference — never free-typed — so the printed invoice and the total
    // shown on the dashboard can never drift apart.
    invoiceItems(b) {
      return buildInvoiceLineItems(b, rates()).items;
    },

    itemLabel(item) {
      return itemSummary(item);
    },

    calculatedTotal(b) {
      return buildInvoiceLineItems(b, rates()).total;
    },

    // The only way the final invoiced amount can differ from calculatedTotal(b) is via
    // an explicit, reasoned adjustment (b._adjustmentAmount + b._adjustmentNote), which
    // approve() enforces below and the printed invoice shows as its own line item.
    finalTotal(b) {
      return this.calculatedTotal(b) + Number(b._adjustmentAmount || 0);
    },

    printInvoice(b) {
      openInvoicePrintWindow(b);
    },

    // Issue #52: client name/phone/address are read-only everywhere else in this
    // dashboard — this is the ONLY path that can change them, and it always requires a
    // reason, which edit_client_info() records in booking_client_edits for an audit trail.
    openClientEdit(b) {
      this.clientEdit = {
        bookingId: b.id,
        client_name: b.client_name || '',
        client_contact: b.client_contact || '',
        client_address: b.client_address || '',
        reason: '',
        error: '',
        busy: false
      };
    },

    closeClientEdit() {
      this.clientEdit = null;
    },

    async saveClientEdit() {
      const edit = this.clientEdit;
      if (!edit) return;
      if (!edit.reason || !edit.reason.trim()) {
        edit.error = t('client_edit_reason_required');
        return;
      }
      edit.busy = true;
      edit.error = '';
      const { data, error } = await supabase.rpc('edit_client_info', {
        p_booking_id: edit.bookingId,
        p_new_client_name: edit.client_name,
        p_new_client_contact: edit.client_contact,
        p_new_client_address: edit.client_address,
        p_reason: edit.reason.trim()
      });
      edit.busy = false;
      if (error) { edit.error = error.message; return; }

      const updated = Array.isArray(data) ? data[0] : data;
      const idx = this.bookings.findIndex(x => x.id === edit.bookingId);
      if (idx !== -1) {
        this.bookings.splice(idx, 1, { ...this.bookings[idx], ...updated });
      }
      this.clientEdit = null;
    },

    async markTikkieSent(b) {
      // Store the actual Tikkie payment link (issue #63) so the client can pay from their
      // own bookings page. Optional — Lígia can still just mark it sent — but if she pastes
      // a link it must be a valid http(s) URL so the client never gets a broken button.
      const url = (b.tikkie_url || '').trim();
      if (url && !isValidPaymentUrl(url)) { alert(t('tikkie_url_invalid')); return; }
      b._busy = true;
      const { error } = await supabase.from('bookings').update({ tikkie_sent: true, tikkie_url: url || null }).eq('id', b.id);
      b._busy = false;
      if (error) { alert(error.message); return; }
      b.tikkie_url = url || null;
      b.tikkie_sent = true;
    },

    // Issue #62: marking the Tikkie as paid is what actually issues the official factuur —
    // the mark_booking_paid() RPC atomically assigns the next sequential factuur_number
    // (only now, never at approval) and stamps paid_at, moving the card to "Done".
    async markPaid(b) {
      b._busy = true;
      const { data, error } = await supabase.rpc('mark_booking_paid', { p_booking_id: b.id });
      b._busy = false;
      if (error) { alert(error.message); return; }
      const paid = Array.isArray(data) ? data[0] : data;
      const idx = this.bookings.findIndex(x => x.id === b.id);
      if (idx !== -1) this.bookings.splice(idx, 1, { ...b, ...paid, _busy: false });
    },

    // Rejects a still-pending booking (the "✕" button in the inbox column). Always asks
    // for confirmation first so an accidental click can never silently discard a request.
    // Only flips status -> 'cancelled'; nothing else about the booking is touched, so it
    // can be safely restored later (see restoreBooking()) without losing any data.
    async rejectBooking(b) {
      const confirmMsg = t('reject_confirm', {
        client: b.client_name || t('invoice.this_client')
      });
      if (!confirm(confirmMsg)) return;

      b._busy = true;
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', b.id)
        .eq('status', 'pending');
      b._busy = false;
      if (error) { alert(error.message); return; }
      b.status = 'cancelled';
    },

    // Brings a rejected booking back into the inbox (pending) so it can be reconsidered —
    // it does NOT need to go all the way through approval again immediately. No extra
    // confirmation here since restoring is non-destructive (unlike rejecting).
    async restoreBooking(b) {
      b._busy = true;
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'pending' })
        .eq('id', b.id)
        .eq('status', 'cancelled');
      b._busy = false;
      if (error) { alert(error.message); return; }
      b.status = 'pending';
    },

    async approve(b) {
      const confirmMsg = t('invoice.confirm_approve', {
        client: b.client_name || t('invoice.this_client')
      });
      if (!confirm(confirmMsg)) return;

      const adjustmentAmount = Number(b._adjustmentAmount || 0);
      const adjustmentNote = (b._adjustmentNote || '').trim();
      if (adjustmentAmount !== 0 && !adjustmentNote) {
        alert(t('adjustment_note_required'));
        return;
      }

      b._busy = true;

      // Issue #52: the final amount is always the calculated line-items total plus this
      // explicit, reasoned adjustment — client_name/client_address/client_contact are
      // read-only here and are never written by this flow (use openClientEdit() instead).
      const { data, error } = await supabase.rpc('approve_booking', {
        p_booking_id: b.id,
        p_calculated_total: this.calculatedTotal(b),
        p_adjustment_amount: adjustmentAmount,
        p_adjustment_note: adjustmentNote || null
      });

      b._busy = false;
      if (error) { alert(error.message); return; }

      const approved = Array.isArray(data) ? data[0] : data;
      const merged = { ...b, ...approved, tikkie_sent: false, _busy: false };
      const idx = this.bookings.findIndex(x => x.id === b.id);
      if (idx !== -1) this.bookings.splice(idx, 1, merged);
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
        ? t('invoice.whatsapp_message', { name: b.client_name, dates: b.date_from + (b.date_to ? ' \u2192 ' + b.date_to : '') })
        : t('invoice.whatsapp_message_generic', { dates: b.date_from + (b.date_to ? ' \u2192 ' + b.date_to : '') });
      return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
    }
  };
};
