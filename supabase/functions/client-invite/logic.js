// Pure decision-making for the client-invite Edge Function (issue #173, MVP).
// No Deno API (Deno.env, Deno.serve, ...), no DOM — same pattern as
// ../gcal-sync/logic.js, so it can be imported and tested directly (see
// tests/bdd/features/client-invite-logic.feature). index.ts is the thin
// adapter that wires these decisions to the real Supabase Admin API.

// A deliberately simple check: one '@', something before and after it, and at
// least one '.' in the domain part — good enough to catch typos in a
// staff-entered form field without trying to be a full RFC 5322 validator.
export function isValidClientEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const SUPPORTED_LANGS = ['en', 'nl', 'pt'];

// Falls back to English for anything unexpected, matching Hugo's own
// defaultContentLanguage (hugo.toml) — never produce a broken/unknown-locale link.
export function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
}

// Where the invite link should send the client after Supabase authenticates
// them via the magic link: the language-prefixed /account/ page (issue #12)
// where they set a password and see their bookings.
export function buildInviteRedirectTo(siteUrl, lang) {
  const base = String(siteUrl || '').replace(/\/+$/, '');
  return base + '/' + normalizeLang(lang) + '/account/';
}

// GoTrue's admin generate_link endpoint rejects `type: 'invite'` with HTTP 422
// and error_code 'email_exists' when the target email is already a registered
// auth.users account — e.g. the client already signed up themselves through
// the normal booking form before Lígia got around to inviting them from the
// clients panel. In that case a 'recovery' link (which authenticates an
// EXISTING user and lets them set a new password, same as an invite link from
// the client's point of view) is the right fallback instead of a hard
// failure — see generateInviteLink()'s retry in index.ts.
export function isEmailExistsError(responseBodyText) {
  try {
    const body = JSON.parse(responseBodyText);
    return body && body.error_code === 'email_exists';
  } catch {
    return false;
  }
}

// GoTrue's invite/recovery links are SINGLE-USE: the token is consumed the
// instant *anything* issues a GET to it. Since Lígia sends this link over
// WhatsApp, WhatsApp's own servers fetch the URL right away to build the
// chat's link-preview card — silently burning the one-time token before the
// client ever gets to click it themselves, so they land on an "invalid or
// expired" error instead of the account page.
//
// The fix is a small bridge page on our own domain (/activate/) that WhatsApp
// can safely preview (it's just static HTML — the crawler never runs JS or
// follows the link on the page), and which only redirects to the real,
// sensitive GoTrue link once a human actually clicks a button on it. This
// wraps the raw action_link into that bridge page's URL, carrying the real
// link along as an (encoded) query parameter.
export function buildActivationUrl(siteUrl, lang, rawLink) {
  const base = String(siteUrl || '').replace(/\/+$/, '');
  return base + '/' + normalizeLang(lang) + '/activate/?verify=' + encodeURIComponent(rawLink);
}
