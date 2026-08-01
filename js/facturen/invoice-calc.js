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

// `rates` = { priceOneVisit, priceTwoVisits, dogWalkPriceFrom, seasonalSurchargePercent,
// extraCatPricePerDay } — all numbers, already resolved from window.GATOWEB_CONFIG by the caller.
export function buildInvoiceLineItems(booking, rates) {
  const days = dateRange(booking.date_from, booking.date_to);
  const seasonGroups = groupBySeason(days);
  const pets = Array.isArray(booking.pets) ? booking.pets : [];
  const catCount = pets.filter(p => p.type !== 'dog').length;
  const hasCat = catCount > 0;
  const hasDog = pets.some(p => p.type === 'dog');
  const { period, visitsPerDay } = frequencyOf(booking.preference);

  const catPerDay = visitsPerDay === 2 ? rates.priceTwoVisits : rates.priceOneVisit;
  const dogPerDay = rates.dogWalkPriceFrom;

  const items = [];
  const surchargePercent = Number(rates.seasonalSurchargePercent) || 0;
  // Extra cats (beyond the first one) are charged a flat per-day amount — unlike the
  // seasonal surcharge, this is known upfront and is also shown on the public price
  // estimate (js/index/booking-form.js), not just the final invoice.
  const extraCatCount = Math.max(0, catCount - 1);
  const extraCatPricePerDay = Number(rates.extraCatPricePerDay) || 0;

  // Each service line is always billed at the plain base rate — the seasonal surcharge
  // (if any) is pushed as its own separate line item right after it, instead of being
  // folded into the unit price. That way the invoice shows exactly what the surcharge
  // adds, rather than a single opaque higher unit price (issue #32 follow-up).
  function pushItem(service, group) {
    const basePerDay = service === 'cat' ? catPerDay : dogPerDay;
    const dayCount = group.days.length;
    const from = isoDate(group.days[0]);
    const to = isoDate(group.days[group.days.length - 1]);
    items.push({
      type: 'service',
      service: service, // 'cat' | 'dog'
      period: period, // 'morning' | 'evening' | 'both' | 'none'
      visitsPerDay: visitsPerDay,
      season: group.season, // 'normal' | 'high'
      from: from,
      to: to,
      dayCount: dayCount,
      unitPrice: round2(basePerDay),
      subtotal: round2(basePerDay * dayCount)
    });

    if (group.season === 'high' && surchargePercent > 0) {
      const surchargePerDay = basePerDay * (surchargePercent / 100);
      items.push({
        type: 'surcharge',
        service: service,
        period: period,
        visitsPerDay: visitsPerDay,
        season: group.season,
        percent: surchargePercent,
        from: from,
        to: to,
        dayCount: dayCount,
        unitPrice: round2(surchargePerDay),
        subtotal: round2(surchargePerDay * dayCount)
      });
    }

    if (service === 'cat' && extraCatCount > 0 && extraCatPricePerDay > 0) {
      const extraCatPerDay = extraCatPricePerDay * extraCatCount;
      items.push({
        type: 'extra-cat',
        service: service,
        period: period,
        visitsPerDay: visitsPerDay,
        season: group.season,
        extraCatCount: extraCatCount,
        from: from,
        to: to,
        dayCount: dayCount,
        unitPrice: round2(extraCatPerDay),
        subtotal: round2(extraCatPerDay * dayCount)
      });
    }
  }

  for (const group of seasonGroups) {
    if (hasCat) pushItem('cat', group);
    if (hasDog) pushItem('dog', group);
  }

  const total = round2(items.reduce((sum, item) => sum + item.subtotal, 0));
  return { items, total };
}
