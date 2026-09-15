import { html } from '../core/html.js';
import { parseOpeningHours, isOpenAt, isClosedAllDay } from '../core/hours.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 0 -- the strip above everything: hours and address, always visible.
 *
 * The "Open now" indicator is opt-in (`hours.showOpenNow`). It is rendered at
 * build time in the shop's timezone and corrected on load by a short script,
 * because a static page cannot know what time it is when someone reads it.
 */
export default {
  id: 'utility-strip',

  css() {
    return `
  .utility { background: var(--dark); color: var(--on-dark-muted); font-size: 13.5px; }
  .utility > .wrap {
    padding-top: 7px; padding-bottom: 7px;
    display: flex; flex-wrap: wrap; gap: 4px 18px; justify-content: space-between;
  }
  .utility a { color: inherit; }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    const show = options.showOpenNow ?? config.hours.showOpenNow;
    const state = openState(config, text);

    return html`<div class="utility">
  <div class="wrap">
    <span>${show && state ? html`<span id="opennow">${state.label}</span> &middot; ` : ''}${data.hoursShort}</span>
    <span>${data.address}</span>
  </div>
</div>`;
  },

  script({ config, options }) {
    const text = copyFor(config);
    const show = options.showOpenNow ?? config.hours.showOpenNow;
    const state = openState(config, text);
    if (!show || !state) return '';

    const payload = JSON.stringify({
      ranges: state.ranges,
      tz: config.business.timezone || null,
      open: text('openNow', 'Open now'),
      closed: text('closedNow', 'Closed right now'),
      closedToday: text('closedToday', 'Closed today'),
    });

    return `  // "Open now" is read in the shop's timezone, not the visitor's.
  (function () {
    var el = document.getElementById('opennow');
    if (!el || !window.Intl) return;
    var cfg = ${payload};
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: cfg.tz || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var get = function (type) { for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value; };
    var day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    var minute = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
    var today = false, open = false;
    cfg.ranges.forEach(function (r) {
      if (r.days.indexOf(day) < 0) return;
      today = true;
      if (minute >= r.from && minute < r.to) open = true;
    });
    el.textContent = open ? cfg.open : today ? cfg.closed : cfg.closedToday;
  })();`;
  },
};

function openState(config, text) {
  const ranges = parseOpeningHours(config.hours.schema);
  if (!ranges.length) return null;
  const now = new Date();
  const tz = config.business.timezone || undefined;
  const label = isClosedAllDay(ranges, now, tz)
    ? text('closedToday', 'Closed today')
    : isOpenAt(ranges, now, tz)
      ? text('openNow', 'Open now')
      : text('closedNow', 'Closed right now');
  return { ranges, label };
}
