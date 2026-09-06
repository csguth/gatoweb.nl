// client-invite — staff-only Edge Function that generates a native Supabase
// invite link for a pre-registered client (issue #173, MVP).
//
// Thin I/O adapter ONLY: the actual decisions (is this a valid email? which
// language should the redirect use?) live in the pure ./logic.js module,
// covered by tests/bdd/features/client-invite-logic.feature. This file just
// wires those decisions to the real Supabase Admin API. See supabase/schema.sql
// for the `clients` table and `link_my_bookings()` RPC this pairs with.
//
// No email is ever sent by this function — that's the whole point: it only
// generates the invite link (Supabase's own secure, single-use, expiring
// token), which Lígia copies from the facturen dashboard
// (static/js/facturen/facturen-app.js) and pastes into WhatsApp herself.
//
// Deploy normally (JWT verification ON, the default): the caller is Lígia's
// authenticated browser session, not a webhook — her own Supabase access
// token is forwarded as the Authorization header and is what authorizes the
// request, checked against is_staff() below the same way every other
// staff-only action in this app is (see checkStaffAccess() in facturen-app.js).
//
// Required secret: SITE_URL (the public site origin, e.g. https://gatoweb.nl
// or the staging URL — used to build the redirect_to the client lands on
// after clicking the invite link). Set once per project:
//   supabase secrets set SITE_URL=https://gatoweb.nl
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are
// auto-injected by the platform.
//
// Manual one-time steps per project (staging AND production), in the
// Supabase dashboard under Authentication:
//   1. URL Configuration -> Redirect URLs: add
//      <SITE_URL>/en/account/, <SITE_URL>/nl/account/, <SITE_URL>/pt/account/
//      (Supabase rejects/falls back to the Site URL for any redirect_to that
//      isn't allow-listed here, silently sending the client to the wrong page).
//   2. Emails -> check the invite link's expiry (default is short — e.g. 1
//      hour). Since Lígia sends the link manually via WhatsApp rather than
//      it going out immediately by email, raise it generously (e.g. a few
//      days) so it doesn't expire before the client gets around to clicking
//      it. If it does expire, generating a new link (button in the clients
//      panel) is the only recovery path in this MVP — there is no "resend".
//   3. `supabase functions deploy client-invite` (JWT verification stays ON,
//      the default — do NOT pass --no-verify-jwt, unlike gcal-sync).

import { buildActivationUrl, buildInviteRedirectTo, isEmailExistsError, isValidClientEmail, normalizeLang } from "./logic.js";

// Called directly from the browser (facturen-app.js), unlike gcal-sync (which
// is only ever called server-to-server by pg_net) — needs CORS headers so the
// browser's preflight OPTIONS request and the real POST both succeed.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// Confirms the caller is staff by re-running the SAME is_staff() check every
// other staff action goes through (supabase/schema.sql), using the caller's
// own JWT via PostgREST — this never has to trust a client-supplied claim.
async function callerIsStaff(supabaseUrl: string, anonKey: string, jwt: string): Promise<boolean> {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/is_staff`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!res.ok) return false;
  return (await res.json()) === true;
}

// Calls GoTrue's admin "generate link" endpoint directly (no supabase-js
// dependency needed, matching the raw-fetch style already used in
// ../gcal-sync/index.ts). This never sends an email by itself — it only
// mints the link, which the caller (facturen-app.js) shows Lígia to copy.
//
// IMPORTANT: GoTrue expects `redirect_to` as a URL QUERY STRING parameter on
// this endpoint, not as a JSON body field — putting it in the body (as an
// earlier version of this function did, nested under `options`) is silently
// ignored, and GoTrue falls back to the project's bare Site URL instead
// (confirmed against gotrue-js's own GoTrueAdminApi.generateLink(), which
// passes `redirectTo` through to `_request` as a dedicated query param).
async function generateInviteLink(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  redirectTo: string,
  type: "invite" | "recovery" = "invite",
): Promise<string> {
  const url = new URL(`${supabaseUrl}/auth/v1/admin/generate_link`);
  url.searchParams.set("redirect_to", redirectTo);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: "Bearer " + serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, email }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    if (type === "invite" && isEmailExistsError(bodyText)) {
      return generateInviteLink(supabaseUrl, serviceRoleKey, email, redirectTo, "recovery");
    }
    throw new Error(`generate_link failed: ${res.status} ${bodyText}`);
  }

  const data = await res.json();
  // The raw GoTrue admin REST response has action_link at the top level;
  // guard for a nested properties.action_link too in case that ever changes.
  const link = data?.action_link || data?.properties?.action_link;
  if (!link) throw new Error("generate_link response had no action_link");
  return link;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = Deno.env.get("SITE_URL");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !siteUrl) {
    return jsonResponse({ error: "Function not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt || !(await callerIsStaff(supabaseUrl, anonKey, jwt))) {
    return jsonResponse({ error: "Not authorized" }, 403);
  }

  let body: { email?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!isValidClientEmail(email)) {
    return jsonResponse({ error: "A valid email is required" }, 400);
  }

  const redirectTo = buildInviteRedirectTo(siteUrl, normalizeLang(body.lang));

  try {
    const rawLink = await generateInviteLink(supabaseUrl, serviceRoleKey, email, redirectTo);
    // Never hand the raw GoTrue link to Lígia — it's single-use, and
    // WhatsApp's own link-preview crawler would silently consume it before
    // the client clicks it. See buildActivationUrl() in logic.js.
    const link = buildActivationUrl(siteUrl, normalizeLang(body.lang), rawLink);
    return jsonResponse({ link });
  } catch (err) {
    console.error("client-invite error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
