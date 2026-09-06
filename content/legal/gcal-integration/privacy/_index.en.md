---
title: "Privacy Policy — Gato Catsit Google Calendar Sync"
description: "How the Gato Catsit Google Calendar integration accesses, uses, and stores Google user data."
private: true
---

# Privacy Policy — Google Calendar Sync

This privacy policy applies to the Google Calendar integration described on the [Gato Catsit — Google Calendar Sync](/en/legal/gcal-integration/) page, used internally by **Gato Catsit**.

**Scope requested:** `https://www.googleapis.com/auth/calendar` (see, create, edit and delete events on the calendar of the authorising account).

**What we access:** only calendar EVENTS (create, update, delete) on the Google Calendar of the Gato Catsit staff member who explicitly authorised this integration via Google's OAuth consent screen. We do not access any other Google service or data.

**How we use it:** each event mirrors one day of an approved catsitting booking (dates, an approximate visit time slot, and the client's name/contact/pets for the admin's own reference). Events are created when a booking is approved, updated when booking details change, and deleted when a booking is cancelled or removed — so the calendar always reflects the current state of bookings.

**Storage:** Google Calendar event identifiers are stored in our application's database (Supabase) solely to allow future updates/deletions of the same event. No Google Calendar data is otherwise copied, sold, shared with third parties, or used for advertising.

**Data sharing:** we do not share any Google user data with third parties. Access is limited to the automated backend process described above.

**Retention & deletion:** calendar events are removed automatically when the corresponding booking is cancelled or deleted. The authorising staff member can revoke this integration's access at any time via [Google Account permissions](https://myaccount.google.com/permissions), which immediately stops all further access.

**Contact:** for any question about this integration or to request data deletion, contact csguth.gatoweb@gmail.com.

_Last updated: 2026-09-06._
