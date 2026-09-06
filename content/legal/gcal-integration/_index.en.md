---
title: "Gato Catsit — Google Calendar Sync"
description: "Internal Google Calendar integration used by Gato Catsit's own admin bookings workflow."
private: true
---

# Gato Catsit — Google Calendar Sync

This page describes an internal integration used by **Gato Catsit**, a small catsitting service based in 's-Hertogenbosch, Netherlands.

**What this integration does:** when a booking is approved, edited, or cancelled in Gato Catsit's private admin dashboard, our backend (a Supabase Edge Function) automatically creates, updates, or deletes matching events on the admin's own Google Calendar — one event per day of the booking, with an approximate time slot. This is only a scheduling convenience for Gato Catsit's own staff; these calendar events are never shown to clients.

**Who uses it:** this integration is used exclusively by Gato Catsit's own staff (the service's administrators). It is not a public product and is not intended for use by any other individual or organisation.

**Data accessed:** only Google Calendar event data (create, read, update, delete of calendar events) on the calendar of the Gato Catsit staff member who authorised the integration. No other Google data (Gmail, Drive, Contacts, etc.) is accessed.

See our [Privacy Policy](/en/legal/gcal-integration/privacy/) for details on how this data is accessed, used and stored.

**Contact:** csguth.gatoweb@gmail.com
