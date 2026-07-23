// Client account (issue #12) + booking persistence to Supabase.
// A booking now requires the client to be logged in (see bookingForm() in booking-form.js) —
// this script exposes window.__gatoClientAuth (login/signup/logout used by the
// inline gate) and window.__saveBookingToSupabase (insert tied to the session).
// Uses the same 'gatoweb-client-auth' storage key as /account.html so a client
// who logs in here stays logged in there, and vice versa; kept separate from
// facturen.html's own 'gatoweb-facturen-auth' key (Ligia's staff-only tool).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = window.GATOWEB_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.GATOWEB_CONFIG.SUPABASE_ANON_KEY;
const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
// detectSessionInUrl is true here (unlike facturen.html) because clients may land on /
// after clicking the email-confirmation link, which appends the session tokens as a URL
// fragment that supabase-js needs to pick up automatically to log them in.
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'gatoweb-client-auth'
  }
}) : null;

window.__gatoClientAuth = {
  configured,
  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  onChange(cb) {
    if (!supabase) return;
    supabase.auth.onAuthStateChange((_event, session) => cb(session));
  },
  async signIn(email, password) {
    if (!supabase) return { session: null, error: 'not configured' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data.session, error: error ? error.message : null };
  },
  async signUp(email, password) {
    if (!supabase) return { session: null, error: 'not configured' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { session: data.session, error: error ? error.message : null };
  },
  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }
};

window.__saveBookingToSupabase = async function (booking) {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return; // send() already gates on this; defensive no-op if missing
    await supabase.from('bookings').insert({
      user_id: session.user.id,
      client_email: session.user.email,
      client_name: booking.clientName || null,
      date_from: booking.from,
      date_to: booking.to || null,
      pets: booking.pets,
      preference: booking.pref,
      suggested_amount: booking.suggestedAmount,
      status: 'pending'
    });
  } catch (e) {
    console.warn('Could not save booking to Supabase', e);
  }
};
