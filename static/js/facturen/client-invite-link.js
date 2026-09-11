// Pure helpers (issue #179) for the Clients page invite flow. No DOM/Alpine/
// Supabase here on purpose — covered by tests/bdd/features/client-invite-link.feature.
//
// Unlike the old GoTrue-native invite link this replaces, a client_invites
// token has no email attached, so building the link is just string
// concatenation — no redirect_to/email-exists fallback logic needed anymore.
// Loading /account/?invite=<token> is a pure read (get_invite_preview() RPC in
// schema.sql), so this link is safe to paste into WhatsApp: its own
// link-preview crawler fetching it can't consume it, unlike the single-use
// GoTrue verify link the old flow used — no /activate/ bridge page needed.

const SUPPORTED_LANGS = ['en', 'nl', 'pt'];

export function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
}

export function buildInviteLink(siteUrl, lang, token) {
  const origin = String(siteUrl || '').replace(/\/+$/, '');
  return `${origin}/${normalizeLang(lang)}/account/?invite=${encodeURIComponent(token)}`;
}
