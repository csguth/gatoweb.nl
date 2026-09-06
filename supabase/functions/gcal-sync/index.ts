// gcal-sync — Google Calendar sync for bookings (issues #6, #160)
//
// Thin I/O adapter ONLY: this file's job is to talk to Postgres/Supabase and
// the Google Calendar API. Every actual business decision (what time slot does
// this booking get? should we create/update/delete/skip the calendar event?)
// lives in the pure, framework-agnostic ./logic.js module instead, which is
// covered by the Gherkin scenarios in tests/bdd/features/gcal-sync-*.feature
// and importable/testable without Deno, a browser or real network calls. If
// you need to change *when* something syncs or *what* the event looks like,
// change logic.js (and its tests) — this file should rarely need to change.
//
// Called by the `notify_gcal_sync()` Postgres trigger (see supabase/schema.sql)
// on INSERT/UPDATE/DELETE of a booking row.
//
// Deploy with `--no-verify-jwt`: the caller is Postgres (via pg_net), not a browser
// with a Supabase session, so auth instead relies on the shared `x-gcal-webhook-secret`
// header matching the GCAL_WEBHOOK_SECRET secret.
//
// Required secrets (see `supabase secrets set`):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID,
//   GCAL_WEBHOOK_SECRET
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import { buildEventBody, decideSyncAction } from "./logic.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

interface BookingRecord {
  id: string;
  status: "pending" | "approved" | "cancelled";
  client_name?: string | null;
  client_email?: string | null;
  client_contact?: string | null;
  date_from: string;
  date_to?: string | null;
  pets?: unknown;
  preference?: string | null;
  tikkie_sent?: boolean;
  google_event_id?: string | null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  record: BookingRecord;
  old_record?: BookingRecord | null;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// SHA-256 hex digest, used to compare secrets in constant time (see timingSafeEqual below).
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Comparing the webhook secret with `!==` leaks timing information proportional to how
// many leading bytes match, letting an attacker brute-force it byte by byte. Hashing both
// sides first means any single-byte difference in the input completely changes the fixed-
// length digest (avalanche effect), so an early string-comparison exit on the hash reveals
// nothing about the original secret.
async function timingSafeSecretEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  return hashA === hashB;
}

async function getGoogleAccessToken(): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth secrets not configured");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to refresh Google access token: ${res.status} ${await res.text()}`,
    );
  }

  const data = await res.json();
  return data.access_token as string;
}

function eventUrl(calendarId: string, eventId?: string): string {
  const base = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`;
  return eventId ? `${base}/${encodeURIComponent(eventId)}` : base;
}

async function createEvent(accessToken: string, calendarId: string, record: BookingRecord) {
  const res = await fetch(eventUrl(calendarId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildEventBody(record)),
  });
  if (!res.ok) {
    throw new Error(`Failed to create Google Calendar event: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  record: BookingRecord,
) {
  const res = await fetch(eventUrl(calendarId, eventId), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildEventBody(record)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update Google Calendar event: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function deleteEvent(accessToken: string, calendarId: string, eventId: string) {
  const res = await fetch(eventUrl(calendarId, eventId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // Google returns 404/410 if the event was already removed directly in Calendar
  // (e.g. Lígia deleted it herself) — treat that the same as a successful delete.
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Failed to delete Google Calendar event: ${res.status} ${await res.text()}`);
  }
}

async function setBookingGoogleEventId(bookingId: string, googleEventId: string | null) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role credentials not available");
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ google_event_id: googleEventId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to persist google_event_id: ${res.status} ${await res.text()}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("GCAL_WEBHOOK_SECRET");
  const providedSecret = req.headers.get("x-gcal-webhook-secret");
  if (
    !expectedSecret || !providedSecret ||
    !(await timingSafeSecretEqual(providedSecret, expectedSecret))
  ) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    return jsonResponse({ error: "GOOGLE_CALENDAR_ID not configured" }, 500);
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { record } = payload;
  // All the actual decision-making happens in decideSyncAction (logic.js) —
  // this handler just executes whatever it decided.
  const decision = decideSyncAction(payload);

  try {
    switch (decision.action) {
      case "create": {
        const accessToken = await getGoogleAccessToken();
        const event = await createEvent(accessToken, calendarId, record);
        await setBookingGoogleEventId(record.id, event.id);
        return jsonResponse({ ok: true, action: "created", eventId: event.id, reason: decision.reason });
      }
      case "update": {
        const accessToken = await getGoogleAccessToken();
        const event = await updateEvent(accessToken, calendarId, record.google_event_id!, record);
        return jsonResponse({ ok: true, action: "updated", eventId: event.id, reason: decision.reason });
      }
      case "delete": {
        const accessToken = await getGoogleAccessToken();
        await deleteEvent(accessToken, calendarId, record.google_event_id!);
        await setBookingGoogleEventId(record.id, null);
        return jsonResponse({ ok: true, action: "deleted", reason: decision.reason });
      }
      default:
        return jsonResponse({ ok: true, action: "skipped", reason: decision.reason });
    }
  } catch (err) {
    console.error("gcal-sync error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
