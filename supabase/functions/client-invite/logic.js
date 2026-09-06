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
