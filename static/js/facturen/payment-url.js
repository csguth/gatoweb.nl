// Pure helper (issue #63): validates the Tikkie payment link Lígia pastes in the
// facturen staff tool before it is stored on a booking and shown to the client on
// account.html. It must be a well-formed absolute http(s) URL, so the client never
// gets a broken or relative link.
//
// No i18n/DOM/Alpine here on purpose — keeping it pure makes it easy to verify
// independently of the facturen app (see tests/bdd/features/payment-url.feature).
export function isValidPaymentUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
