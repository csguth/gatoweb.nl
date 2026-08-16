// Shared date display formatter (issue #78): the project's chosen "day first"
// convention for any date shown to a client or to staff — account.html,
// facturen.html and the printed invoice (js/shared/invoice-document.js) all
// route through this so no raw ISO (`YYYY-MM-DD`) or locale-dependent string
// (e.g. `toLocaleDateString('nl-NL')`, which drops the leading zero) leaks
// into the UI.
//
// Accepts a `YYYY-MM-DD` date-only string (as stored in bookings.date_from/
// date_to and computed by js/facturen/invoice-calc.js), a full ISO timestamp
// (e.g. bookings.paid_at/approved_at), a Date instance, or a nullish value.
export function formatDateDDMMYYYY(value) {
  if (!value) return '';

  // A bare 'YYYY-MM-DD' date-only string is parsed from its own digits instead
  // of via `new Date(str)` — that constructor treats it as UTC midnight, which
  // shifts the date by one day in timezones ahead of UTC (e.g. Europe/
  // Amsterdam), same pitfall documented in invoice-calc.js's isoDate(). Anchored
  // to the full string so full timestamps (which do carry real time/zone info)
  // fall through to the Date-based branch below instead.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return day + '/' + month + '/' + year;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return day + '/' + month + '/' + date.getFullYear();
}
