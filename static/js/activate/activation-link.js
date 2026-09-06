// Pure decision-making for the /activate/ bridge page (issue #173
// follow-up): decodes and validates the `verify` query parameter carrying
// the real, single-use GoTrue link — see buildActivationUrl() in
// supabase/functions/client-invite/logic.js for why this indirection
// exists (WhatsApp's link-preview crawler would otherwise burn the token
// before the client clicks it). No DOM/Alpine here on purpose —
// activate-app.js is the thin adapter that wires this to the rendered page.
import { isValidPaymentUrl } from '../facturen/payment-url.js';

// Reuses the same "well-formed absolute http(s) URL" check the Tikkie
// payment link goes through (isValidPaymentUrl) — the safety requirement is
// identical: never render an untrusted value as a clickable href unless
// it's a genuine http(s) URL, ruling out a javascript:/data: URL from a
// malformed or tampered `verify` parameter.
export function resolveActivationLink(rawQueryValue) {
  if (!rawQueryValue) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(rawQueryValue);
  } catch {
    return null;
  }
  return isValidPaymentUrl(decoded) ? decoded : null;
}
