// Pure calculation module for facturen (issue #32): builds invoice line items from a
// booking, splitting the stay into contiguous "normal" / "high season" day runs and
// applying the seasonal surcharge percentage on top of the base daily rate for the
// high-season runs. High season = July, August, December, January.
//
// No i18n/DOM/Alpine here on purpose — this only returns structured data (service,
// period, day counts, prices). js/facturen/facturen-app.js turns that into the actual
// (always Dutch) invoice text. Keeping this pure makes the pricing math easy to reason
// about/verify independently of rendering.

const HIGH_SEASON_MONTHS = [7, 8, 12, 1]; // July, August, December, January (1-indexed)

export function isHighSeason(date) {
  return HIGH_SEASON_MONTHS.indexOf(date.getMonth() + 1) !== -1;
}

function dateRange(fromStr, toStr) {
  const from = new Date(fromStr + 'T00:00:00');
  const to = toStr && toStr > fromStr ? new Date(toStr + 'T00:00:00') : from;
  const days = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// Splits an ordered list of Date objects into contiguous runs grouped by season, so a
// booking crossing e.g. June 29 -> July 3 becomes two groups (normal, then high).
function groupBySeason(days) {
  const groups = [];
  for (const day of days) {
    const season = isHighSeason(day) ? 'high' : 'normal';
    const last = groups[groups.length - 1];
    if (last && last.season === season) {
      last.days.push(day);
    } else {
      groups.push({ season, days: [day] });
    }
  }
  return groups;
}

// Maps a booking's visit preference to the invoice period label + visits/day, matching
// the same mapping used for pricing in js/index/booking-form.js.
function frequencyOf(preference) {
  if (preference === 'both') return { period: 'both', visitsPerDay: 2 };
  if (preference === 'morning') return { period: 'morning', visitsPerDay: 1 };
  if (preference === 'evening') return { period: 'evening', visitsPerDay: 1 };
  return { period: 'none', visitsPerDay: 1 };
}

// Intentionally NOT using toISOString() here: it converts to UTC first, which shifts
// the date by one day whenever the local timezone is ahead of UTC (e.g. Europe/Amsterdam)
// and the local time component is midnight. Formatting from the local date parts avoids
// that off-by-one bug.
function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// `rates` = { priceOneVisit, priceTwoVisits, dogWalkPriceFrom, seasonalSurchargePercent }
// — all numbers, already resolved from window.GATOWEB_CONFIG by the caller.
export function buildInvoiceLineItems(booking, rates) {
  const days = dateRange(booking.date_from, booking.date_to);
  const seasonGroups = groupBySeason(days);
  const pets = Array.isArray(booking.pets) ? booking.pets : [];
  const hasCat = pets.some(p => p.type !== 'dog');
  const hasDog = pets.some(p => p.type === 'dog');
  const { period, visitsPerDay } = frequencyOf(booking.preference);

  const surchargeMultiplier = 1 + (Number(rates.seasonalSurchargePercent) || 0) / 100;
  const catPerDay = visitsPerDay === 2 ? rates.priceTwoVisits : rates.priceOneVisit;
  const dogPerDay = rates.dogWalkPriceFrom;

  const items = [];

  function pushItem(service, group) {
    const basePerDay = service === 'cat' ? catPerDay : dogPerDay;
    const unitPrice = group.season === 'high' ? basePerDay * surchargeMultiplier : basePerDay;
    const dayCount = group.days.length;
    items.push({
      service: service, // 'cat' | 'dog'
      period: period, // 'morning' | 'evening' | 'both' | 'none'
      visitsPerDay: visitsPerDay,
      season: group.season, // 'normal' | 'high'
      from: isoDate(group.days[0]),
      to: isoDate(group.days[group.days.length - 1]),
      dayCount: dayCount,
      unitPrice: round2(unitPrice),
      subtotal: round2(unitPrice * dayCount)
    });
  }

  for (const group of seasonGroups) {
    if (hasCat) pushItem('cat', group);
    if (hasDog) pushItem('dog', group);
  }

  const total = round2(items.reduce((sum, item) => sum + item.subtotal, 0));
  return { items, total };
}
