/**
 * Tenant config schema + validator.
 *
 * Zero-dependency and deliberately small. It exists to turn "this tenant is
 * missing a phone number" into a build-time error with a path, rather than a
 * live page reading `undefined`.
 *
 * Unknown keys are ALLOWED and preserved. Custom sections carry their own
 * content in the tenant file, and the platform must not be the thing that
 * stops a tenant adding a field.
 */

const t = {
  string: (opts = {}) => ({ kind: 'string', ...opts }),
  number: (opts = {}) => ({ kind: 'number', ...opts }),
  boolean: (opts = {}) => ({ kind: 'boolean', ...opts }),
  array: (of, opts = {}) => ({ kind: 'array', of, ...opts }),
  object: (shape, opts = {}) => ({ kind: 'object', shape, ...opts }),
  any: (opts = {}) => ({ kind: 'any', ...opts }),
  union: (kinds, opts = {}) => ({ kind: 'union', kinds, ...opts }),
};

export const TENANT_SCHEMA = t.object({
  domains: t.array(t.string(), { default: [] }),

  business: t.object({
    name: t.string({ required: true }),
    initials: t.string(),
    city: t.string({ required: true }),
    region: t.string(),
    phone: t.string({ required: true }),
    sms: t.string(),
    address: t.object({
      street: t.string({ required: true }),
      city: t.string(),
      region: t.string(),
      postalCode: t.string(),
      country: t.string({ default: 'US' }),
    }, { required: true }),
    crossStreet: t.string(),
    timezone: t.string(),
    openedYear: t.number(),
    yearsInBusiness: t.number(),
    priceRange: t.string({ default: '$$' }),
    licenseLine: t.string(),
    warranty: t.string(),
    serviceArea: t.string(),
    reviewsUrl: t.string(),
  }, { required: true }),

  hours: t.object({
    short: t.string(),
    showOpenNow: t.boolean({ default: false }),
    rows: t.array(t.object({ day: t.string({ required: true }), time: t.string({ required: true }) }), { default: [] }),
    schema: t.array(t.string(), { default: [] }),
  }, { default: {} }),

  rating: t.object({
    value: t.string(),
    count: t.number(),
  }, { default: {} }),

  badges: t.array(t.string(), { default: [] }),

  services: t.array(t.object({
    name: t.string({ required: true }),
    price: t.string({ required: true }),
    line: t.string(),
  }), { default: [] }),

  reasons: t.array(t.object({
    title: t.string({ required: true }),
    body: t.string({ required: true }),
  }), { default: [] }),

  reviews: t.array(t.object({
    name: t.string({ required: true }),
    vehicle: t.string(),
    when: t.string(),
    text: t.string({ required: true }),
  }), { default: [] }),

  owner: t.object({
    name: t.string(),
    title: t.string(),
    note: t.string(),
    photo: t.string(),
    photoAlt: t.string(),
  }, { default: {} }),

  special: t.object({
    eyebrow: t.string({ default: 'This month' }),
    title: t.string(),
    body: t.string(),
    fine: t.string(),
  }, { default: {} }),

  cards: t.array(t.object({
    title: t.string({ required: true }),
    body: t.string({ required: true }),
  }), { default: [] }),

  photos: t.object({
    logo: t.string(),
    hero: t.string(),
    heroAlt: t.string(),
    gallery: t.array(t.object({
      src: t.string({ required: true }),
      cap: t.string(),
      alt: t.string(),
    }), { default: [] }),
  }, { default: {} }),

  map: t.object({
    embed: t.string(),
    bbox: t.string(),
    marker: t.string(),
    title: t.string(),
  }, { default: {} }),

  nav: t.array(t.object({
    label: t.string({ required: true }),
    href: t.string({ required: true }),
  }), { default: [] }),

  copy: t.object({}, { default: {}, open: true }),

  forms: t.object({
    endpoint: t.string(),
    method: t.string({ default: 'post' }),
    honeypot: t.string({ default: 'company' }),
    fields: t.array(t.object({
      name: t.string({ required: true }),
      label: t.string({ required: true }),
      type: t.string(),
      rows: t.number(),
      placeholder: t.string(),
      autocomplete: t.string(),
      required: t.boolean(),
    })),
  }, { default: {} }),

  seo: t.object({
    title: t.string(),
    description: t.string(),
    canonical: t.string(),
    favicon: t.string(),
    ogImage: t.string(),
    noindex: t.boolean({ default: false }),
  }, { default: {} }),

  layout: t.array(t.union(['string', 'object']), { default: [] }),

  extra: t.object({}, { default: {}, open: true }),
}, { required: true });

const typeOf = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

function walk(spec, value, path, errors) {
  const at = path || '(root)';

  if (value === undefined || value === null) {
    if (spec.required) errors.push(`${at}: required`);
    if (spec.default === undefined) return value === null ? null : undefined;
    // Run the default back through the spec so nested defaults fill in too:
    // an absent `hours` should still arrive as { rows: [], schema: [] }.
    return walk({ ...spec, default: undefined, required: false }, structuredClone(spec.default), path, errors);
  }

  switch (spec.kind) {
    case 'any':
      return value;

    case 'union':
      if (!spec.kinds.includes(typeOf(value))) {
        errors.push(`${at}: expected one of ${spec.kinds.join(' | ')}, got ${typeOf(value)}`);
      }
      return value;

    case 'string':
    case 'number':
    case 'boolean':
      if (typeOf(value) !== spec.kind) errors.push(`${at}: expected ${spec.kind}, got ${typeOf(value)}`);
      return value;

    case 'array': {
      if (!Array.isArray(value)) {
        errors.push(`${at}: expected array, got ${typeOf(value)}`);
        return value;
      }
      return value.map((item, i) => walk(spec.of, item, `${at}[${i}]`, errors));
    }

    case 'object': {
      if (typeOf(value) !== 'object') {
        errors.push(`${at}: expected object, got ${typeOf(value)}`);
        return value;
      }
      // Unknown keys pass through untouched -- custom sections rely on this.
      const out = { ...value };
      for (const [key, childSpec] of Object.entries(spec.shape || {})) {
        const child = walk(childSpec, value[key], path ? `${path}.${key}` : key, errors);
        if (child !== undefined) out[key] = child;
      }
      return out;
    }

    default:
      return value;
  }
}

/**
 * Validate and fill defaults. Returns { config, errors }. `config` is usable
 * even when `errors` is non-empty -- callers decide whether to fail.
 */
export function validateTenant(input) {
  const errors = [];
  const config = walk(TENANT_SCHEMA, input, '', errors);
  return { config, errors };
}
