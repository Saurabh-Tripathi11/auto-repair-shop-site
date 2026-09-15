/**
 * Opening-hours parsing, shared by the JSON-LD block and the optional
 * "Open now" indicator.
 *
 * Input is schema.org `openingHours` syntax, which the tenant already has to
 * write for Google: "Mo-Fr 07:30-18:00", "Sa 08:00-14:00", "Mo,We 09:00-17:00".
 *
 * The indicator is evaluated in the SHOP's timezone, never the visitor's. A
 * driver in another state looking at a shop's page should see whether the shop
 * is open, not whether it would be open where they are.
 */

const DAY_INDEX = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
const DAY_ORDER = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const minutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
};

function expandDays(spec) {
  const out = [];
  for (const part of spec.split(',')) {
    const [from, to] = part.trim().split('-');
    if (!(from in DAY_INDEX)) continue;
    if (!to) { out.push(DAY_INDEX[from]); continue; }
    let i = DAY_INDEX[from];
    const end = DAY_INDEX[to];
    for (let guard = 0; guard < 8; guard++) {
      out.push(i);
      if (i === end) break;
      i = (i + 1) % 7;
    }
  }
  return [...new Set(out)];
}

/** "Mo-Fr 07:30-18:00" -> { days: [1,2,3,4,5], from: 450, to: 1080 } */
export function parseOpeningHours(lines = []) {
  const ranges = [];
  for (const line of lines) {
    const m = String(line).trim().match(/^([A-Za-z,\-]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (!m) continue;
    const days = expandDays(m[1]);
    if (!days.length) continue;
    ranges.push({ days, from: minutes(m[2]), to: minutes(m[3]) });
  }
  return ranges;
}

/** Day-of-week and minute-of-day for `date`, read in `timeZone`. */
export function localClock(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || undefined,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')] ?? date.getDay();
  const hour = Number(get('hour')) % 24;
  return { day: weekday, minute: hour * 60 + Number(get('minute')) };
}

export function isOpenAt(ranges, date, timeZone) {
  const { day, minute } = localClock(date, timeZone);
  return ranges.some((r) => r.days.includes(day) && minute >= r.from && minute < r.to);
}

/** True when the shop has no range on `date`'s weekday at all. */
export function isClosedAllDay(ranges, date, timeZone) {
  const { day } = localClock(date, timeZone);
  return !ranges.some((r) => r.days.includes(day));
}

export { DAY_INDEX, DAY_ORDER };
