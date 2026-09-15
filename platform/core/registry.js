/**
 * Section registry.
 *
 * A page is an ordered list of section ids. The registry maps an id to the
 * module that renders it. Platform defaults are registered first; a tenant's
 * own `sections/` directory is registered over the top, so:
 *
 *   tenants/acme/sections/hero.js      -> replaces the platform hero for acme
 *   tenants/acme/sections/warranty.js  -> a section only acme has
 *
 * A section module is a plain object:
 *
 *   export default {
 *     id: 'hero',
 *     render(ctx) { return html`...` },   // required
 *     css(ctx)    { return '...' },       // optional, emitted once per id
 *     head(ctx)   { return html`...` },   // optional, goes in <head>
 *     script(ctx) { return '...' },       // optional, one inline <script>
 *   }
 *
 * `ctx` is { config, data, theme, tenant, options, section }.
 */

export class SectionRegistry {
  constructor() {
    this.sections = new Map();
    this.origins = new Map();
  }

  register(section, origin = 'platform') {
    if (!section || typeof section.render !== 'function') {
      throw new Error(`Section "${section?.id ?? '(unnamed)'}" from ${origin} has no render()`);
    }
    if (!section.id) throw new Error(`Section from ${origin} is missing an id`);
    this.sections.set(section.id, section);
    this.origins.set(section.id, origin);
    return this;
  }

  registerAll(sections, origin = 'platform') {
    for (const section of sections) this.register(section, origin);
    return this;
  }

  has(id) {
    return this.sections.has(id);
  }

  originOf(id) {
    return this.origins.get(id);
  }

  ids() {
    return [...this.sections.keys()];
  }

  get(id) {
    const section = this.sections.get(id);
    if (!section) {
      throw new Error(
        `Unknown section "${id}". Registered: ${this.ids().sort().join(', ') || '(none)'}. ` +
        `Add tenants/<slug>/sections/${id}.js to define it for one tenant, ` +
        `or platform/sections/${id}.js to define it for everyone.`
      );
    }
    return section;
  }

  /** Shallow copy, so a tenant's overrides never leak into another tenant. */
  clone() {
    const next = new SectionRegistry();
    next.sections = new Map(this.sections);
    next.origins = new Map(this.origins);
    return next;
  }
}

/**
 * Normalise a layout entry. Both forms are accepted:
 *   "hero"
 *   { "use": "gallery", "as": "gallery-bottom", "options": { "columns": 2 } }
 */
export function normalizeLayoutEntry(entry, index) {
  if (typeof entry === 'string') return { use: entry, key: entry, options: {} };
  if (entry && typeof entry === 'object' && entry.use) {
    return { use: entry.use, key: entry.as || `${entry.use}-${index}`, options: entry.options || {} };
  }
  throw new Error(`layout[${index}] must be a section id or { use, as?, options? }`);
}
