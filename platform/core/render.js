/**
 * Page renderer. Turns a loaded tenant into one static HTML document.
 *
 * The output is a single file: no client framework, no bundler, no hydration.
 * The only JavaScript that reaches the browser is whatever the sections in the
 * layout ask for -- by default, the booking form's submit handler.
 */

import { html, raw, esc, join } from './html.js';
import { derive } from './derive.js';
import { baseStylesheet } from './stylesheet.js';
import { fontLinks } from './tokens.js';
import { normalizeLayoutEntry } from './registry.js';

export const DEFAULT_LAYOUT = [
  'utility-strip',
  'header',
  'hero',
  'trust-bar',
  'services',
  'specials',
  'owner',
  'gallery',
  'reviews',
  'location',
  'booking',
  'footer',
  'call-bar',
];

function dedent(text) {
  return String(text ?? '').replace(/\n\s*$/, '');
}

export function renderPage(tenant, { now = new Date() } = {}) {
  const { config, theme, registry, hooks } = tenant;
  const warnings = [];

  let data = derive(config, { now });
  if (typeof hooks.transform === 'function') {
    data = hooks.transform({ config, data, theme, tenant }) || data;
  }

  const layout = (config.layout.length ? config.layout : DEFAULT_LAYOUT).map(normalizeLayoutEntry);

  const bodyParts = [];
  const cssParts = [];
  const headParts = [];
  const scriptParts = [];
  const seenCss = new Set();

  for (const entry of layout) {
    const section = registry.get(entry.use);
    const ctx = { config, data, theme, tenant, options: entry.options, section: entry, warn: (m) => warnings.push(`${entry.use}: ${m}`) };

    bodyParts.push(html`\n<!-- ${entry.key} -->\n${section.render(ctx)}`);

    if (typeof section.css === 'function' && !seenCss.has(entry.use)) {
      seenCss.add(entry.use);
      const css = dedent(section.css(ctx));
      if (css.trim()) cssParts.push(css);
    }
    if (typeof section.head === 'function') {
      const head = section.head(ctx);
      if (head) headParts.push(head);
    }
    if (typeof section.script === 'function') {
      const script = dedent(section.script(ctx));
      if (script.trim()) scriptParts.push(script);
    }
  }

  if (typeof hooks.head === 'function') headParts.push(hooks.head({ config, data, theme, tenant }));
  if (typeof hooks.styles === 'function') cssParts.push(dedent(hooks.styles({ config, data, theme, tenant })));
  if (typeof hooks.scripts === 'function') scriptParts.push(dedent(hooks.scripts({ config, data, theme, tenant })));
  if (tenant.overridesCss?.trim()) cssParts.push(`  /* tenants/${tenant.slug}/overrides.css */\n${tenant.overridesCss.trim()}`);

  const { seo } = data;
  const head = join([
    html`<meta charset="utf-8">`,
    html`<meta name="viewport" content="width=device-width, initial-scale=1">`,
    html`<title>${seo.title}</title>`,
    seo.description ? html`<meta name="description" content="${seo.description}">` : '',
    seo.noindex ? html`<meta name="robots" content="noindex">` : '',
    seo.canonical ? html`<link rel="canonical" href="${seo.canonical}">` : '',
    seo.favicon ? html`<link rel="icon" href="${seo.favicon}">` : '',
    html`<meta property="og:type" content="website">`,
    html`<meta property="og:title" content="${seo.title}">`,
    seo.description ? html`<meta property="og:description" content="${seo.description}">` : '',
    seo.ogImage ? html`<meta property="og:image" content="${seo.ogImage}">` : '',
    seo.ogImage ? html`<meta name="twitter:card" content="summary_large_image">` : '',
    raw(fontLinks(theme)),
    html`<script type="application/ld+json">\n${data.jsonLdScript}\n</script>`,
    ...headParts,
    html`<style>\n${raw(baseStylesheet(theme))}\n${raw(cssParts.join('\n'))}\n</style>`,
  ].filter(Boolean), '\n');

  const scripts = scriptParts.length
    ? html`\n<script>\n${raw(scriptParts.join('\n'))}\n</script>`
    : '';

  const document = html`<!DOCTYPE html>
<html lang="${config.seo.lang || 'en'}">
<head>
${head}
</head>
<body>
${join(bodyParts, '\n')}
${scripts}
</body>
</html>
`;

  return { html: document.toString(), warnings, layout, data };
}

export { esc };
