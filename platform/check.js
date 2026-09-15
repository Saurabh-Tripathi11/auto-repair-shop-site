/**
 * Pre-flight checks.
 *
 * This is the guard rail that makes self-serve theming safe. A tenant can pick
 * any accent colour they like; what they cannot do is ship a page whose call
 * button fails contrast, whose JSON-LD disagrees with the visible rating, or
 * whose hero image is still the stock photo.
 *
 * Errors fail the run. Warnings do not, but they are the list of things
 * standing between a tenant and launch.
 */

import { contrast } from './core/color.js';
import { renderPage } from './core/render.js';
import { createStore } from './build.js';

const AA = 4.5;

function contrastChecks(theme, report) {
  const { color } = theme;
  const pairs = [
    ['button label on accent', color.onAccent, color.accent, 'error'],
    ['accent on page background', color.accent, color.surface, 'error'],
    ['links on page background', color.link, color.surface, 'error'],
    ['body text on page background', color.ink, color.surface, 'error'],
    ['secondary text on page background', color.ink2, color.surface, 'error'],
    ['caption text on page background', color.ink3, color.surface, 'error'],
    ['body text on wash band', color.ink, color.wash, 'error'],
    ['secondary text on wash band', color.ink2, color.wash, 'error'],
    ['white text on brand dark', '#ffffff', color.dark, 'error'],
    ['hero body copy on brand dark', color.onDark, color.dark, 'error'],
    ['utility + footer copy on brand dark', color.onDarkMuted, color.dark, 'error'],
    ['hero fine print on brand dark', color.onDarkFaint, color.dark, 'error'],
    ['footer labels on brand dark', color.onDarkLabel, color.dark, 'warn'],
    ['footer legal on brand dark', color.onDarkLegal, color.dark, 'warn'],
    ['quiet text on page background', color.inkQuiet, color.surface, 'warn'],
  ];

  for (const [what, fg, bg, level] of pairs) {
    let ratio;
    try {
      ratio = contrast(fg, bg);
    } catch {
      report.error(`theme: ${what} — ${fg} or ${bg} is not a colour this check understands`);
      continue;
    }
    if (ratio < AA) {
      const message = `contrast: ${what} is ${ratio.toFixed(2)}:1 (${fg} on ${bg}), below the 4.5:1 floor`;
      level === 'error' ? report.error(message) : report.warn(message);
    }
  }
}

function contentChecks(config, data, report) {
  const { business } = config;

  if (!config.hours.schema.length) {
    report.warn('hours.schema is empty — JSON-LD ships without openingHours, so Google will not show hours');
  }
  if (config.hours.showOpenNow && !business.timezone) {
    report.warn('hours.showOpenNow is on but business.timezone is unset — the indicator will use the visitor\'s clock');
  }
  if (!business.licenseLine) {
    report.warn('business.licenseLine is empty — the inspection licence number is a checkable credential worth showing');
  }
  if (!config.reviews.length) report.warn('no reviews');
  if (!config.services.length) report.error('no services — the price list is the point of the page');
  if (config.rating.value && !config.reviews.length) {
    report.warn('rating is set but no reviews are shown — Google penalises markup ratings that are not on the page');
  }
  if (!config.seo.canonical) report.warn('seo.canonical is unset — no sitemap will be generated');

  const photos = [
    ['photos.hero', config.photos.hero],
    ['owner.photo', config.owner.photo],
    ...config.photos.gallery.map((g, i) => [`photos.gallery[${i}].src`, g.src]),
  ];
  const stock = photos.filter(([, src]) => src && /unsplash\.com|placeholder|via\.placeholder/.test(src));
  if (stock.length) {
    report.warn(`${stock.length} stock placeholder photo${stock.length > 1 ? 's' : ''} (${stock.map(([k]) => k).join(', ')}) — real shop photos outperform stock on this page`);
  }
  if (config.photos.hero && !config.photos.heroAlt) report.warn('photos.heroAlt is empty — the hero image has no alt text');
  for (const [i, photo] of config.photos.gallery.entries()) {
    if (!photo.alt && !photo.cap) report.warn(`photos.gallery[${i}] has neither alt nor cap`);
  }

  if (/\b555-?\d{4}\b/.test(business.phone)) {
    report.warn(`business.phone ${business.phone} is a 555 sample number`);
  }
  if (!data.phoneE164 || data.phoneE164.length < 11) {
    report.error(`business.phone "${business.phone}" does not produce a usable E.164 number`);
  }
}

function outputChecks(html, data, config, report) {
  if (!html.includes(`href="tel:${data.phoneE164}"`)) {
    report.error('rendered page has no tel: link to the shop number');
  }
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) report.error(`page has ${h1s.length} <h1> elements, expected exactly 1`);

  const imgs = html.match(/<img\b[^>]*>/g) || [];
  const missingAlt = imgs.filter((tag) => !/\balt=/.test(tag));
  if (missingAlt.length) report.error(`${missingAlt.length} <img> without an alt attribute`);

  const iframes = html.match(/<iframe\b[^>]*>/g) || [];
  const missingTitle = iframes.filter((tag) => !/\btitle=/.test(tag));
  if (missingTitle.length) report.error(`${missingTitle.length} <iframe> without a title attribute`);

  const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) report.error('no JSON-LD block');
  else {
    try {
      const parsed = JSON.parse(ld[1]);
      if (config.rating.value && parsed.aggregateRating?.ratingValue !== String(config.rating.value)) {
        report.error('JSON-LD rating does not match the configured rating');
      }
    } catch (e) {
      report.error(`JSON-LD does not parse: ${e.message}`);
    }
  }

  if (/>undefined<|"undefined"|\[object Object\]/.test(html)) {
    report.error('rendered page contains "undefined" or "[object Object]" — a section read a missing field');
  }

  // Every var(--x) a section reaches for must be a token :root actually sets.
  const rootBlock = html.match(/:root \{([\s\S]*?)\n  \}/);
  if (rootBlock) {
    const defined = new Set([...rootBlock[1].matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    const used = new Set([...html.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
    const undefinedVars = [...used].filter((name) => !defined.has(name)).sort();
    if (undefinedVars.length) {
      report.error(`CSS uses undefined custom propert${undefinedVars.length === 1 ? 'y' : 'ies'}: ${undefinedVars.join(', ')}`);
    }
  }

  const kb = Buffer.byteLength(html) / 1024;
  if (kb > 60) report.warn(`page is ${kb.toFixed(1)} KB of HTML — the budget is 2s to interactive on 4G`);
}

/**
 * Content that is configured but has no section in the layout renders nowhere.
 * Silently dropping a tenant's reviews is worse than any styling bug.
 */
function layoutChecks(config, layout, report) {
  const used = new Set(layout.map((entry) => entry.use));
  const buckets = [
    ['services', 'services', config.services.length],
    ['reviews', 'reviews', config.reviews.length],
    ['badges', 'trust-bar', config.badges.length],
    ['cards / special', 'specials', config.cards.length + (config.special.title ? 1 : 0)],
    ['photos.gallery', 'gallery', config.photos.gallery.length],
    ['owner / reasons', 'owner', (config.owner.note ? 1 : 0) + config.reasons.length],
    ['hours.rows', 'location', config.hours.rows.length],
  ];
  for (const [what, section, count] of buckets) {
    if (count && !used.has(section)) {
      report.warn(`${what} is configured but "${section}" is not in the layout — that content renders nowhere`);
    }
  }
}

export async function check(root, { only = null, log = console.log } = {}) {
  const store = createStore(root);
  const slugs = only ? [only] : await store.list();
  let errors = 0;
  let warnings = 0;

  for (const slug of slugs) {
    const lines = [];
    const report = {
      error: (m) => { errors++; lines.push(`    ERROR  ${m}`); },
      warn: (m) => { warnings++; lines.push(`    warn   ${m}`); },
    };

    let tenant;
    try {
      tenant = await store.load(slug, { strict: false });
    } catch (error) {
      log(`  ${slug}`);
      log(`    ERROR  ${error.message}`);
      errors++;
      continue;
    }

    for (const message of tenant.configErrors) report.error(`config: ${message}`);
    contrastChecks(tenant.theme, report);

    if (!tenant.configErrors.length) {
      try {
        const { html, data, layout, warnings: renderWarnings } = renderPage(tenant);
        for (const warning of renderWarnings) report.warn(warning);
        layoutChecks(tenant.config, layout, report);
        contentChecks(tenant.config, data, report);
        outputChecks(html, data, tenant.config, report);
      } catch (error) {
        report.error(`render failed: ${error.message}`);
      }
    }

    log(`  ${slug}${lines.length ? '' : '  ok'}`);
    for (const line of lines) log(line);
  }

  log('');
  log(`  ${slugs.length} tenant${slugs.length === 1 ? '' : 's'}, ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`);
  return { errors, warnings };
}
