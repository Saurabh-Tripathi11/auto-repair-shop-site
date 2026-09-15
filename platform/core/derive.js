/**
 * Everything a section needs that is a function of the tenant config rather
 * than authored by hand: phone hrefs, the directions URL, initials, the map
 * embed, the JSON-LD block, SEO defaults.
 *
 * Derived once per render and handed to every section as `data`, so no section
 * has to re-derive -- and so a tenant that wants a different rule can override
 * one value in their config instead of forking a section.
 */

import { jsonScript } from './html.js';

const digitsOf = (value) => String(value || '').replace(/\D/g, '');

/** "(512) 555-0147" -> "+15125550147". Honours an already-E.164 input. */
export function toE164(phone, country = 'US') {
  const raw = String(phone || '').trim();
  if (raw.startsWith('+')) return '+' + digitsOf(raw);
  const digits = digitsOf(raw);
  if (!digits) return '';
  const prefix = country === 'US' || country === 'CA' ? '1' : '';
  return '+' + (digits.length === 10 && prefix ? prefix + digits : digits);
}

export function initialsOf(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function addressLine(address, business) {
  const city = address.city || business.city || '';
  const region = address.region || business.region || '';
  const tail = [city, [region, address.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [address.street, tail].filter(Boolean).join(', ');
}

const DEFAULT_NAV = [
  { label: 'Services', href: '#services' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Hours', href: '#location' },
  { label: 'Book', href: '#book' },
];

function buildJsonLd(config, d) {
  const { business, rating } = config;
  const node = {
    '@context': 'https://schema.org',
    '@type': config.seo.schemaType || 'AutoRepair',
    name: business.name,
    telephone: d.phoneE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city || business.city,
      addressRegion: business.address.region || business.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country || 'US',
    },
  };
  if (config.hours.schema?.length) node.openingHours = config.hours.schema;
  if (rating.value && rating.count) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(rating.value),
      reviewCount: String(rating.count),
    };
  }
  if (business.priceRange) node.priceRange = business.priceRange;
  if (config.seo.canonical) node.url = config.seo.canonical;
  return node;
}

export function derive(config, { now = new Date() } = {}) {
  const { business } = config;
  const country = business.address.country || 'US';
  const phoneE164 = toE164(business.phone, country);
  const smsE164 = business.sms ? toE164(business.sms, country) : phoneE164;
  const address = addressLine(business.address, business);
  const thisYear = now.getFullYear();
  const openedYear = business.openedYear
    ?? (business.yearsInBusiness ? thisYear - business.yearsInBusiness : undefined);
  const years = business.yearsInBusiness ?? (openedYear ? thisYear - openedYear : undefined);

  const d = {
    phone: business.phone,
    phoneE164,
    phoneHref: phoneE164 ? `tel:${phoneE164}` : '',
    smsHref: smsE164 ? `sms:${smsE164}` : '',
    address,
    directionsUrl: address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
      : '',
    initials: business.initials || initialsOf(business.name),
    thisYear,
    openedYear,
    years,
    hoursShort: config.hours.short || config.hours.rows.map((r) => `${r.day} ${r.time}`).join(', '),
    nav: config.nav.length ? config.nav : DEFAULT_NAV,
    rating: config.rating,
    reviewsUrl: business.reviewsUrl
      || `https://www.google.com/search?q=${encodeURIComponent(`${business.name} ${business.city} reviews`)}`,
    mapSrc: config.map.embed
      || (config.map.bbox
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${config.map.bbox}&layer=mapnik${config.map.marker ? `&marker=${config.map.marker}` : ''}`
        : ''),
    mapTitle: config.map.title || `Map to ${business.name}`,
  };

  d.seo = {
    title: config.seo.title
      || `${business.name} — Auto Repair in ${[business.city, business.region].filter(Boolean).join(', ')}`,
    description: config.seo.description
      || `${business.name}: ${config.services.slice(0, 4).map((s) => s.name.toLowerCase()).join(', ')} in ${business.city}. Call ${business.phone}.`,
    canonical: config.seo.canonical || '',
    favicon: config.seo.favicon || '',
    ogImage: config.seo.ogImage || config.photos.hero || '',
    noindex: config.seo.noindex,
  };

  d.jsonLd = buildJsonLd(config, d);
  d.jsonLdScript = jsonScript(d.jsonLd);

  return d;
}
