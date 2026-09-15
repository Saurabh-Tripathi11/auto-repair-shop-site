/**
 * Tenant scaffolding. `npm run new -- <slug>` writes a complete, valid tenant
 * with every field present and obviously unfilled, plus the launch checklist.
 *
 * A starter that validates but is visibly placeholder beats a starter with
 * fields missing: the shop owner's answer to "what goes here" is the content.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const titleCase = (slug) =>
  slug.split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export function starterConfig(slug) {
  const name = titleCase(slug);
  return {
    domains: [`${slug}.example.com`],
    business: {
      name,
      city: 'CITY',
      region: 'ST',
      phone: '(555) 555-0100',
      address: { street: '000 Main St', city: 'CITY', region: 'ST', postalCode: '00000', country: 'US' },
      timezone: 'America/Chicago',
      crossStreet: 'Cross street, landmark, and where to park.',
      openedYear: new Date().getFullYear() - 10,
      licenseLine: '',
      warranty: '24 month / 24,000 mile',
      serviceArea: 'Neighbourhoods and towns served, plus the tow policy.',
    },
    hours: {
      short: 'Mon–Fri 8–5',
      rows: [
        { day: 'Mon – Fri', time: '8:00am – 5:00pm' },
        { day: 'Saturday', time: 'Closed' },
        { day: 'Sunday', time: 'Closed' },
      ],
      schema: ['Mo-Fr 08:00-17:00'],
    },
    rating: { value: '', count: 0 },
    badges: ['ASE Certified'],
    services: [
      { name: 'Brake repair', price: 'from $000', line: 'One concrete sentence about how the job actually goes.' },
      { name: 'Oil & filter change', price: 'from $00', line: 'Include how long it takes.' },
      { name: 'Check-engine diagnostics', price: '$000', line: 'Say what the fee covers and when it is waived.' },
      { name: 'A/C repair', price: 'from $000', line: '' },
    ],
    reasons: [
      { title: 'You see it before we fix it', body: 'How the shop shows a customer the worn part.' },
      { title: 'The estimate is the bill', body: 'What happens when something else turns up.' },
      { title: "We'll tell you it can wait", body: 'The line that builds the most trust on the page.' },
    ],
    reviews: [],
    owner: { name: 'OWNER NAME', title: 'Owner', note: "Written in the owner's own voice. Name a year, a previous employer, and end with a concrete offer.", photo: '', photoAlt: '' },
    special: { eyebrow: 'This month', title: '', body: '', fine: '' },
    cards: [
      { title: 'Big repair? You can pay it out.', body: 'Named lenders and terms.' },
      { title: "While it's here", body: 'Shuttle, loaner, after-hours key drop.' },
    ],
    photos: { hero: '', heroAlt: '', gallery: [] },
    map: { bbox: '', marker: '' },
    copy: {
      headline: 'Headline naming the three things people call about, and how fast.',
      tagline: 'One sentence on what kind of shop this is and what a customer gets.',
      heroFinePrint: '',
    },
    forms: { endpoint: '' },
    seo: { canonical: `https://${slug}.example.com/` },
  };
}

const CHECKLIST = (slug, name) => `# ${name}

Scaffolded tenant. Everything below has to be true before this goes live.

## Content
- [ ] Shop name, phone, address and hours match the Google Business Profile **character for character**
- [ ] Phone number is real (the starter is a 555 number and \`check\` will say so)
- [ ] Every certification in \`badges\` is one the shop actually holds
- [ ] Service prices are real numbers, with honest hedging (\`from $189\`, \`quoted\`)
- [ ] Owner note is in the owner's voice, specific, and ends with a concrete offer
- [ ] Reviews are verbatim from Google, with name, vehicle and recency
- [ ] \`business.licenseLine\` carries the state inspection licence number
- [ ] \`hours.schema\` is filled in, or JSON-LD ships without opening hours

## Design
- [ ] \`theme.json\` sets \`color.accent\` (and \`color.dark\` if the brand is not navy)
- [ ] \`npm run check\` reports no contrast errors

## Assets
- [ ] Real shop photos in \`public/\`, served as WebP or AVIF, hero ≤1400px, gallery ≤800px
- [ ] \`photos.hero\`, \`owner.photo\` and the gallery point at them
- [ ] Favicon at \`public/favicon.png\`, referenced from \`seo.favicon\`

## Wiring
- [ ] \`forms.endpoint\` points at a real handler (fields: name, phone, vehicle, problem)
- [ ] Spam protection on the handler — the honeypot field is \`company\`
- [ ] \`seo.canonical\` is the live URL
- [ ] \`domains\` lists every hostname, and DNS points at the host

Preview: \`npm run dev\` then http://${slug}.localhost:4000/
`;

export async function scaffold(root, slug, { log = console.log } = {}) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`Slug "${slug}" must be lowercase letters, digits and hyphens — it becomes a subdomain.`);
  }
  const dir = path.join(root, 'tenants', slug);
  if (existsSync(dir)) throw new Error(`tenants/${slug} already exists`);

  const config = starterConfig(slug);
  await mkdir(path.join(dir, 'public'), { recursive: true });
  await writeFile(path.join(dir, 'tenant.json'), JSON.stringify(config, null, 2) + '\n', 'utf8');
  await writeFile(
    path.join(dir, 'theme.json'),
    JSON.stringify({ color: { accent: '#c02a1e' } }, null, 2) + '\n',
    'utf8'
  );
  await writeFile(path.join(dir, 'CHECKLIST.md'), CHECKLIST(slug, config.business.name), 'utf8');
  await writeFile(path.join(dir, 'public', '.gitkeep'), '', 'utf8');

  log(`  created tenants/${slug}/`);
  log(`    tenant.json    content, layout and domains`);
  log(`    theme.json     design tokens`);
  log(`    CHECKLIST.md   what has to be true before launch`);
  log(`    public/        assets served at the site root`);
  log('');
  log(`  next:  npm run dev   ->  http://${slug}.localhost:4000/`);
  return dir;
}
