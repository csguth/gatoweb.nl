// bookingForm() Alpine component for index.html's booking form.
function bookingForm() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('gatoweb_booking') || '{}'); } catch(e) {}

  const PRICE_ONE_VISIT = Number(window.GATOWEB_CONFIG.PRICE_ONE_VISIT) || 0;
  const PRICE_TWO_VISITS = Number(window.GATOWEB_CONFIG.PRICE_TWO_VISITS) || 0;
  const DOG_WALK_PRICE_FROM = Number(window.GATOWEB_CONFIG.DOG_WALK_PRICE_FROM) || 0;
  const t = (key, options) => window.t(key, options);

  return {
    clientName: saved.clientName || '',
    address: saved.address || '',
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
      try { localStorage.setItem('gatoweb_booking', JSON.stringify({ clientName: this.clientName, address: this.address, pets: this.pets, pref: this.pref })); } catch(e) {}
    },
    async init() {
      this.$watch('clientName', () => this._save());
      this.$watch('address', () => this._save());
      this.$watch('pets', () => this._save());
      this.$watch('pref', () => this._save());
      if (window.__gatoClientAuth && window.__gatoClientAuth.configured) {
        this.session = await window.__gatoClientAuth.getSession();
        window.__gatoClientAuth.onChange((session) => { this.session = session; });
      }
    },
    _suggestedAmount() {
      const start = new Date(this.from);
      const end = this.to && this.to > this.from ? new Date(this.to) : start;
      const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
      const hasDog = this.pets.some(p => p.type === 'dog');
      const hasCat = this.pets.some(p => p.type !== 'dog');
      const perDay = this.pref === 'both' ? PRICE_TWO_VISITS : PRICE_ONE_VISIT;
      let total = 0;
      if (hasCat) total += perDay * days;
      if (hasDog) total += DOG_WALK_PRICE_FROM * days;
      return total;
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
          from: this.from,
          to: this.to,
          pets: this.pets,
          pref: this.pref,
          suggestedAmount: this._suggestedAmount()
        });
      }

      this.sent = true;
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
}
