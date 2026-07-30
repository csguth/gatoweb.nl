// bookingForm() Alpine component for index.html's booking form.
import { buildInvoiceLineItems } from '../facturen/invoice-calc.js';

window.bookingForm = function bookingForm() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('gatoweb_booking') || '{}'); } catch(e) {}

  const PRICE_ONE_VISIT = Number(window.GATOWEB_CONFIG.PRICE_ONE_VISIT) || 0;
  const PRICE_TWO_VISITS = Number(window.GATOWEB_CONFIG.PRICE_TWO_VISITS) || 0;
  const DOG_WALK_PRICE_FROM = Number(window.GATOWEB_CONFIG.DOG_WALK_PRICE_FROM) || 0;
  const t = (key, options) => window.t(key, options);

  return {
    clientName: saved.clientName || '',
    address: saved.address || '',
    clientContact: saved.clientContact || '',
    from: '',
    to: '',
    pref: saved.pref || '',
    pets: saved.pets && saved.pets.length ? saved.pets : [{ name: '', type: 'cat', otherType: '' }],
    today: new Date().toISOString().split('T')[0],

    // Client account (issue #12): a booking can only be sent once the client is
    // logged in. `session` mirrors window.__gatoClientAuth's current session.
    session: null,
    sent: false,
    showAuth: false,
    authMode: 'login',
    authEmail: '',
    authPassword: '',
    authError: '',
    authInfo: '',
    authLoading: false,

    _save() {
      try { localStorage.setItem('gatoweb_booking', JSON.stringify({ clientName: this.clientName, address: this.address, clientContact: this.clientContact, pets: this.pets, pref: this.pref })); } catch(e) {}
    },
    async init() {
      this.$watch('clientName', () => this._save());
      this.$watch('address', () => this._save());
      this.$watch('clientContact', () => this._save());
      this.$watch('pets', () => this._save());
      this.$watch('pref', () => this._save());
      if (window.__gatoClientAuth && window.__gatoClientAuth.configured) {
        this.session = await window.__gatoClientAuth.getSession();
        window.__gatoClientAuth.onChange((session) => { this.session = session; });
      }
    },
    // Estimate shown to the client on the booking form itself (issue #43), computed
    // with the very same pricing logic used for the final factuur
    // (js/facturen/invoice-calc.js) so the two numbers never drift apart. Per the
    // decision in issue #32/#43, the seasonal surcharge is intentionally NOT included
    // here — it only ever appears once Lígia issues the actual factuur.
    _suggestedAmount() {
      if (!this.from) return 0;
      const rates = {
        priceOneVisit: PRICE_ONE_VISIT,
        priceTwoVisits: PRICE_TWO_VISITS,
        dogWalkPriceFrom: DOG_WALK_PRICE_FROM,
        seasonalSurchargePercent: 0
      };
      const booking = { date_from: this.from, date_to: this.to, pets: this.pets, preference: this.pref };
      return buildInvoiceLineItems(booking, rates).total;
    },
    async send() {
      if (!this.from) {
        alert(t('booking.start_date_required'));
        return;
      }
      // Address is required on the invoice (issue #32) — validated client-side same as
      // the date, since there's no server-side booking form validation on this static site.
      if (!this.address || !this.address.trim()) {
        alert(t('booking.address_required'));
        return;
      }
      // Client account required (issue #12) — if Supabase is configured and the client
      // isn't logged in yet, show the inline login/signup gate instead of sending.
      if (window.__gatoClientAuth && window.__gatoClientAuth.configured && !this.session) {
        this.authError = '';
        this.authInfo = '';
        this.showAuth = true;
        return;
      }
      await this._completeSend();
    },
    async _completeSend() {
      if (window.__saveBookingToSupabase) {
        await window.__saveBookingToSupabase({
          clientName: this.clientName,
          address: this.address,
          clientContact: this.clientContact,
          from: this.from,
          to: this.to,
          pets: this.pets,
          pref: this.pref,
          suggestedAmount: this._suggestedAmount()
        });
      }

      this.sent = true;
    },
    // Lets the client message Lígia on WhatsApp right after sending the request,
    // pre-filled with the dates just booked, mirroring the existing wa.me buttons.
    whatsappConfirmLink() {
      const toRange = this.to && this.to > this.from ? ' \u2192 ' + this.to : '';
      const message = t('booking.whatsapp_confirm_message', { from: this.from, toRange });
      const number = (window.GATOWEB_CONFIG && window.GATOWEB_CONFIG.WHATSAPP_NUMBER) || '';
      return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    },
    async authLogin() {
      this.authLoading = true;
      this.authError = '';
      const { session, error } = await window.__gatoClientAuth.signIn(this.authEmail, this.authPassword);
      this.authLoading = false;
      if (error) { this.authError = error; return; }
      this.session = session;
      this.showAuth = false;
      this.authPassword = '';
      await this._completeSend();
    },
    async authSignup() {
      this.authLoading = true;
      this.authError = '';
      this.authInfo = '';
      const { session, error } = await window.__gatoClientAuth.signUp(this.authEmail, this.authPassword);
      this.authLoading = false;
      if (error) { this.authError = error; return; }
      if (!session) {
        this.authInfo = t('booking.account_created_check_email_send');
        this.authMode = 'login';
        this.authPassword = '';
        return;
      }
      this.session = session;
      this.showAuth = false;
      await this._completeSend();
    },
    async logout() {
      if (window.__gatoClientAuth) await window.__gatoClientAuth.signOut();
      this.session = null;
    }
  };
};
