// Pure decision logic (issue #180 follow-up) for the three invite-related
// actions on the staff Clients page (generate invite link, send password
// reset email, unlink account). No DOM/Alpine/real Supabase client here on
// purpose — clients-app.js is only a thin adapter that binds these to the
// real `supabase.rpc`/`supabase.auth.resetPasswordForEmail` and turns the
// returned result into alert()s / local state mutation. Covered by
// tests/bdd/features/client-invite-actions.feature.
import { buildInviteLink, buildAccountUrl } from './client-invite-link.js';

// Every action below returns the same shape: { ok: true, ... } on success or
// { ok: false, message } on failure, where `message` is always a
// human-readable string ready to show the user (either the RPC/Auth error's
// own message, or a caller-supplied generic fallback for the "backend
// reported success but gave us nothing usable" corner case that isn't a
// thrown error at all).

// `rpc` is `(name, args) => Promise<{ data, error }>`, matching supabase-js's
// own `.rpc()` return shape — the same fake can drive every scenario below
// without a real Supabase client.
export async function generateInviteLink({ rpc, clientId, origin, lang, genericErrorMessage }) {
  const { data: token, error } = await rpc('create_client_invite', { p_client_id: clientId });
  if (error) return { ok: false, message: error.message };
  if (!token) return { ok: false, message: genericErrorMessage };
  return { ok: true, link: buildInviteLink(origin, lang, token) };
}

// `resetPasswordForEmail` is `(email, opts) => Promise<{ error }>`, matching
// supabase-js's `auth.resetPasswordForEmail()`.
export async function sendPasswordReset({ rpc, resetPasswordForEmail, clientId, origin, lang, genericErrorMessage }) {
  const { data: email, error } = await rpc('get_linked_account_email', { p_client_id: clientId });
  if (error) return { ok: false, message: error.message };
  if (!email) return { ok: false, message: genericErrorMessage };
  const redirectTo = buildAccountUrl(origin, lang);
  const { error: resetError } = await resetPasswordForEmail(email, { redirectTo });
  if (resetError) return { ok: false, message: resetError.message };
  return { ok: true };
}

export async function unlinkAccount({ rpc, clientId }) {
  const { data: hadLink, error } = await rpc('unlink_client_account', { p_client_id: clientId });
  if (error) return { ok: false, message: error.message };
  return { ok: true, hadLink: Boolean(hadLink) };
}
