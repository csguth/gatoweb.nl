// gcal-sync — Google Calendar sync for bookings (issue #6)
//
// Called by the `notify_gcal_sync()` Postgres trigger (see supabase/schema.sql)
// whenever a booking is inserted or has its status changed:
//   - INSERT (status=pending)      -> creates a tentative all-day event
//   - UPDATE pending -> approved   -> patches the event to confirmed
// Any other transition (e.g. cancelled) is out of scope for now.
//
// Deploy with `--no-verify-jwt`: the caller is Postgres (via pg_net), not a browser
// with a Supabase session, so auth instead relies on the shared `x-gcal-webhook-secret`
// header matching the GCAL_WEBHOOK_SECRET secret.
//
// Required secrets (see `supabase secrets set`):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID,
//   GCAL_WEBHOOK_SECRET
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

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

function petsSummary(pets: unknown): string {
  if (!Array.isArray(pets) || pets.length === 0) return "";
  return pets
    .map((p) => (typeof p === "string" ? p : (p as { name?: string })?.name ?? ""))
    .filter(Boolean)
    .join(", ");
}

// Google Calendar's all-day `end.date` is exclusive, so a booking ending on
// `date_to` (inclusive) needs `date_to + 1 day` as the event's end date.
function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildEventBody(record: BookingRecord, status: "tentative" | "confirmed") {
  const summary = `Catsitting — ${record.client_name || record.client_email || "Client"}`;
  const petsLine = petsSummary(record.pets);
  const descriptionLines = [
    record.client_email ? `Email: ${record.client_email}` : null,
    record.client_contact ? `Contact: ${record.client_contact}` : null,
    petsLine ? `Pets: ${petsLine}` : null,
    record.preference ? `Preference: ${record.preference}` : null,
  ].filter(Boolean);

  const start = record.date_from;
  const endDate = addDays(record.date_to || record.date_from, 1);

  return {
    summary,
    description: descriptionLines.join("\n"),
    start: { date: start },
    end: { date: endDate },
    status,
    reminders: { useDefault: true },
  };
}

async function createEvent(accessToken: string, calendarId: string, record: BookingRecord) {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEventBody(record, "tentative")),
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to create Google Calendar event: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function confirmEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  record: BookingRecord,
) {
  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${
      encodeURIComponent(eventId)
    }`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEventBody(record, "confirmed")),
    },
  );
  if (!res.ok) {
    throw new Error(`Failed to confirm Google Calendar event: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function updateBookingGoogleEventId(bookingId: string, googleEventId: string) {
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
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!calendarId) {
    return jsonResponse({ error: "GOOGLE_CALENDAR_ID not configured" }, 500);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { type, record, old_record } = payload;

  try {
    const accessToken = await getGoogleAccessToken();

    if (type === "INSERT" && record.status === "pending") {
      const event = await createEvent(accessToken, calendarId, record);
      await updateBookingGoogleEventId(record.id, event.id);
      return jsonResponse({ ok: true, action: "created", eventId: event.id });
    }

    if (
      type === "UPDATE" &&
      record.status === "approved" &&
      old_record?.status === "pending" &&
      record.google_event_id
    ) {
      const event = await confirmEvent(accessToken, calendarId, record.google_event_id, record);
      return jsonResponse({ ok: true, action: "confirmed", eventId: event.id });
    }

    return jsonResponse({ ok: true, action: "skipped" });
  } catch (err) {
    console.error("gcal-sync error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
