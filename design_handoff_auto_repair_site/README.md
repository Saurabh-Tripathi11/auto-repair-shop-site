# Handoff: Auto Repair Shop — Single-Page Website

## Overview

A one-page marketing site for an independent auto repair shop. It has exactly one job: **get a stressed person, on a phone, with a car making a noise, to tap the phone number.** Everything else on the page exists to make that tap feel safe.

The primary conversion is a `tel:` link. The secondary conversion is a four-field callback request form. There is no e-commerce, no login, no scheduling backend, no blog.

## About the design files

The files in `design-reference/` are **design references created in HTML** — a prototype showing the intended look and behavior, not production source to lift wholesale.

`index.html` at the root of this bundle **is** a working, static, standalone implementation of that design: one file, inline/embedded CSS, ~30 KB, no JS framework, no libraries. It is a legitimate ship-it-today artifact for a small business.

Your task, therefore, is one of:

1. **Ship `index.html` as-is** (or nearly): swap the business details, replace the stock photos with the shop's real photos, point the form at a handler, deploy to any static host. This is the recommended path for a single small-business site.
2. **Recreate it in the target codebase's environment** (Next.js, Astro, Rails views, WordPress block theme, whatever already exists) using that codebase's established patterns, components, and styling approach. Use `index.html` as the pixel and copy reference.

Do not introduce a heavy framework, a component library, a carousel, an animation library, or a CSS-in-JS runtime for this page. The performance budget below is a hard requirement of the design.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, copy, and interaction behavior. Recreate it pixel-accurately. Every hex value, font size, and piece of copy in this document is intentional and has been iterated on.

Two things are explicitly *placeholders*:
- **Business details** (name, phone, address, hours, reviews, owner, prices) are realistic sample data for a fictional shop. See "Swapping in a real shop."
- **Photography** is free Unsplash stock. Real shop photos are strongly preferred; see "Assets."

## Performance budget (a requirement, not a nice-to-have)

- **Under 2 seconds to interactive on a mid-range phone on 4G.**
- No JS framework. The only script in `index.html` is a ~6-line form-submit handler.
- One webfont family, 5 weights, `display=swap`, with `preconnect`. If you want to go further: self-host the `.woff2` subset.
- Images are the only real weight. Hero loads eagerly; everything below the fold is `loading="lazy"`. Serve real photos as AVIF/WebP, max ~1400px wide for the hero and ~800px for the gallery.
- The map is an `<iframe>` (OpenStreetMap embed, no API key, no billing). It is `loading="lazy"` and below the fold. Do not replace it with a JS mapping library unless the shop needs interactive routing.

---

## Page structure

A single scrolling column. Section order is fixed and deliberate — proof of legitimacy comes *before* the sales pitch.

| # | Section | ID | Purpose |
|---|---------|-----|---------|
| 0 | Utility strip | — | Hours + address, always visible at the very top |
| 1 | Header | — | Sticky; identity + phone number always reachable |
| 2 | Hero | — | Headline, rating, Call Now, Book, Text us |
| 3 | Trust bar | — | Certifications, years, warranty |
| 4 | Services | `#services` | 6 services with real starting prices |
| 5 | Specials / financing / amenities | — | Three cards under the service list |
| 6 | Owner + how we work | — | Owner photo, first-person note, 3 commitments |
| 7 | Shop photos | — | 3 captioned photos of the real shop |
| 8 | Reviews | `#reviews` | 3 Google reviews with name, vehicle, recency |
| 9 | Location | `#location` | Address, cross-street, hours table, map, service area |
| 10 | Booking form | `#book` | 4 fields + confirmation state |
| 11 | Footer | — | Phone, address, hours repeated; license line |
| 12 | Sticky call bar | `#callbar` | Fixed bottom, mobile only |

---

## Design tokens

Declared as CSS custom properties on `:root` in `index.html`.

### Color

| Token | Hex | Used for |
|-------|-----|----------|
| `--navy` | `#0b2136` | Utility strip, hero background, footer |
| — | `#0f2a44` | Hero image placeholder backing |
| `--ink` | `#1c2229` | Body text, headings |
| `--ink-2` | `#4b5663` | Secondary body copy |
| `--ink-3` | `#5c6874` | Captions, meta, labels |
| `--line` | `#dbe1e8` | Section borders, card borders |
| `--line-2` | `#e3e8ee` | List row dividers |
| `--wash` | `#f2f5f8` | Alternating section background |
| `--accent` | `#c02a1e` | Call buttons, prices, left rules, "This month" eyebrow |
| `--link` | `#0f4c81` | Links, focus rings, outline buttons |
| `--star` | `#f1a01a` | Review stars (light backgrounds) |
| — | `#ffd25e` | Hero stars (on navy) |
| — | `#c3d2e1` | Hero body copy on navy |
| — | `#b9cadb` | Footer + utility strip text on navy |
| — | `#9fb4c8` | Hero fine print on navy |
| — | `#7e98b2` | Footer column labels |
| — | `#8ba4bc` | Footer legal line |
| — | `#1d3c5a` | Footer divider rule |
| — | `#2b3948` | Trust badge text |
| — | `#c9d3de` | Trust badge border |
| — | `#c2ccd7` | Dashed border on the specials card |
| — | `#fbfcfd` | Specials card fill |
| — | `#bcc6d1` | Input border |
| — | `#cfe0ef` | Input focus outline |
| — | `#bdd8c2` / `#f3f9f4` | Form success border / fill |
| — | `#79838f` | Form fine print |
| — | `#cfd7e0` | Sticky bar top border |
| — | `rgba(255,255,255,0.95)` | Sticky bar background (+ `backdrop-filter: blur(8px)`) |

Accent alternatives that were validated against this palette: `#d1601a` (orange), `#0f4c81` (blue), `#1d7a4c` (green). Red is the default — it reads as urgency without looking like a warning.

### Typography

**Public Sans** (Google Fonts), weights 400/500/600/700/800. Fallback stack: `Helvetica, Arial, sans-serif`.

| Role | Size | Weight | Line-height | Letter-spacing |
|------|------|--------|-------------|----------------|
| `h1` | `clamp(29px, 6.4vw, 40px)` | 800 | 1.14 | −0.025em |
| `h2` | `clamp(24px, 5.2vw, 31px)` | 800 | normal | −0.025em |
| Body | 17px | 400 | 1.55 | — |
| Hero lede | 17.5px | 400 | 1.5 | — |
| Section lede | 16.5px | 400 | 1.55 | — |
| Header phone | 19px | 800 | — | −0.02em |
| Header shop name | 17.5px | 800 | 1.15 | −0.015em |
| Call Now (hero) | 20px | 800 | — | −0.01em |
| Call Now (sticky bar) | 17.5px | 800 | — | — |
| Book / Text buttons | 16.5px | 700 | — | — |
| Service name | 18px | 700 | — | — |
| Service price | 15px | 700 | — | — |
| Service line | 16px | 400 | — | — |
| Card heading | 17px | 700 | — | — |
| Card body | 15.5px | 400 | — | — |
| Review text | 16.5px | 400 | — | — |
| Review attribution | 14px | 400 (name 700) | — | — |
| Owner note | 17.5px | 400 | — | — |
| Form label | 14px | 700 | — | — |
| Input text | 16px | 400 | — | — |
| Submit button | 18.5px | 800 | — | — |
| Utility strip | 13.5px | 400 | — | — |
| Trust badge | 13px | 700 | — | 0.01em |
| Eyebrow labels | 11.5px | 700–800 | — | 0.1–0.11em, uppercase |
| Footer legal | 13px | 400 | — | — |

**Inputs are 16px minimum** — anything smaller triggers iOS zoom-on-focus, which is a conversion killer on mobile forms.

`text-wrap: pretty` is applied to all multi-line prose blocks.

### Spacing & geometry

- Content max-width: **1140px**, horizontal padding **18px**.
- Standard section padding: **44px** top and bottom. Hero: `34px 18px 38px`. Photo strip: `34px` top, `10px` bottom.
- Grid/flex gaps: **9px** (stacked buttons), **14px** (cards, photos), **18px** (reviews), **20px** (commitments), **26–32px** (major columns).
- Border radius: **4px** (logo tile, trust badges), **5px** (buttons, inputs), **6px** (cards, images, map).
- Borders: **1px** hairlines; **1.5px** on outline buttons and the sticky-bar Book button; **2px solid** on service-list column tops; **2px dashed** on the specials card; **3px solid** left rule on commitments.
- No drop shadows anywhere. Depth comes from hairlines and the navy/wash alternation. This is deliberate — shadows are what make these sites look like 2015 templates.

### Tap targets

| Element | Min height |
|---------|------------|
| Hero Call Now | 60px |
| Hero Book / Text us | 52px |
| Sticky bar buttons | 54px |
| Form inputs | 50px |
| Submit button | 56px |
| Directions button | ~44px (11px padding + 15.5px text) |

Nothing tappable is under 44px.

---

## Section-by-section spec

### 0. Utility strip
Navy background, `#b9cadb` text at 13.5px, `7px` vertical padding. Flex row, `space-between`, `flex-wrap: wrap`, gap `4px 18px`. Left: hours summary (`Mon–Fri 7:30–6, Sat 8–2`). Right: full street address.

*Note:* the design-reference prototype also computes a live "Open now / Closed right now" string from the browser clock and shows it here. The static `index.html` omits it. If you implement it, compute server-side or on mount — and get the shop's timezone right, not the visitor's.

### 1. Header (sticky)
`position: sticky; top: 0; z-index: 30`, white, 1px bottom border, `11px` vertical padding.

Left: 42×42px navy tile, 4px radius, containing the shop's two-letter initials (800 weight, 17px, −0.03em, white, centered). Then shop name (17.5px/800, `nowrap` + `ellipsis` so long names don't break the row) over "Serving {city} since {year}" (12.5px, `--ink-3`).

Right: nav (Services / Reviews / Hours / Book — 15px/600, `--ink`, hover `--link`, 20px gap) then the phone block: "CALL THE SHOP" eyebrow (11.5px/700, 0.1em, uppercase, `--ink-3`) over the number (19px/800, `--accent`, `nowrap`). The whole phone block is one `tel:` anchor.

**Nav is hidden below 860px** (`#topnav { display: none }`) — the sticky bottom bar covers navigation on mobile. The phone block stays visible at every width.

### 2. Hero
Navy background. Grid: `repeat(auto-fit, minmax(320px, 1fr))` — two columns on desktop, stacks with text first on mobile.

Text column: h1 → lede (max `48ch`) → rating line (`★★★★★ 4.8 · 127 Google reviews`, 15px/600, `#ffd25e`) → button stack (max-width 420px) → fine print (14.5px, `#9fb4c8`).

Button stack: full-width **Call Now** (accent, 60px, `☎ Call Now · (512) 555-0147` — the number is *in* the button label, not hidden behind it), then a row of **Book an Appointment** (white on navy, `flex: 1 1 0`) and **Text us** (outlined `#3c5b77`, `flex: 0 1 auto`, 18px side padding).

Image column: `min-height: 260px`, `object-fit: cover`, fills the grid cell.

Hover: Call Now `filter: brightness(1.08)`; Book `background: #e7eef5`; Text us `border-color: #fff`.

### 3. Trust bar
`--wash` background, 1px bottom border, `13px` vertical padding. Flex-wrap row, gap `10px 12px`: five bordered white badge chips (ASE Certified / ASE Master Technician / NAPA AutoCare Center / AAA Approved Repair / BBB Accredited A+), then a plain text run for years-in-business and warranty.

**Only list certifications the shop actually holds.** These are verifiable claims.

### 4. Services
h2 + lede, then a two-column grid (`minmax(300px, 1fr)`), each column with a `2px solid --ink` top rule. Rows: name (18px/700) and price (15px/700, accent) on a `space-between` baseline row, description below (16px, `--ink-2`), `1px` bottom divider, `15px` vertical padding.

Prices are stated as `from $189`, `$110`, `quoted`, `$25.50`. Real numbers with honest hedging; a lead with no price expectation calls three shops.

### 5. Specials / financing / amenities
Three-card grid (`minmax(255px, 1fr)`, 14px gap, `26px` top margin, `align-items: start`).

1. **Specials** — 2px dashed border, `#fbfcfd` fill. Accent uppercase eyebrow "THIS MONTH", 19px/800 offer headline, body, then fine print at 13px/`#79838f`.
2. **Financing** — plain bordered card. Named lenders and terms.
3. **Amenities** — shuttle, loaner, after-hours key drop.

These three answer the objections that actually stop a call: *too expensive*, *can't afford it right now*, *I can't be without my car*.

### 6. Owner + how we work
`--wash` band. **Flex** (not grid) so the layout collapses cleanly: photo `flex: 0 0 230px; max-width: 100%`, text `flex: 1 1 340px; min-width: 0`, gap `26px 32px`, `align-items: flex-start`.

Photo: 1:1, 6px radius, `object-fit: cover`, 230px max. Name (17px/700) + role (14.5px, `--ink-3`) beneath.

Text: h2, first-person owner note (17.5px, `#2b3948`, max `60ch`), then a 3-up grid (`minmax(230px, 1fr)`, 20px gap) of commitments — each a `3px solid --accent` left rule with 14px left padding, 17px/700 title, 15.5px body.

The note is written in the owner's voice, mentions a specific year and a specific prior employer, and ends with a concrete offer ("bring the estimate in and I'll look at it with you"). Keep it that specific when you swap shops — generic owner blurbs are worse than no owner blurb.

### 7. Shop photos
Three `<figure>`s in `minmax(230px, 1fr)`, 14px gap. Each: 4:3 container, 6px radius, `overflow: hidden`, `object-fit: cover` image, then a 14px `--ink-3` caption at `7px` top margin.

Captions state a fact ("Two bays and off-street parking in back"), not a mood.

### 8. Reviews
h2 and the rating summary share a wrapping baseline row (gap `6px 16px`). Then `minmax(275px, 1fr)`, 18px gap — three flex-column blocks, 10px gap, **no card chrome**: stars (14px, `--star`), quote (16.5px), attribution (14px, `--ink-3`, name in 700/`--ink`).

Attribution carries **name · vehicle · recency** ("Marisol R. · 2018 CR-V · 2 months ago"). The vehicle is what makes a review read as real. Below, a link out to the full Google listing.

Reviews must be real and verbatim. Trim with `…` if needed; never rewrite.

### 9. Location
`--wash`, 1px top border. Grid `minmax(290px, 1fr)`, 30px gap.

Left: h2, address (18px/700), **cross-street and parking note** (15.5px, `--ink-2`) — the single most useful line on the page for someone already driving. Outlined Directions button (`1.5px solid --link`, white fill, 5px radius) linking to `google.com/maps/dir/?api=1&destination=<urlencoded address>`. Then the hours table: `space-between` rows, 9px padding, 1px dividers, day in `--ink-2`, time in 700. Then service area with a bold `Service area:` lead-in, listing neighborhoods and towns by name plus the tow policy.

Right: OpenStreetMap `<iframe>`, `min-height: 330px`, 6px radius, 1px border, `loading="lazy"`, with a `title` for a11y.

### 10. Booking form
Two columns (`minmax(290px, 1fr)`, 32px gap).

Left: h2, expectation-setting line ("usually within the hour during shop hours"), and an explicit **escape hatch**: if the car isn't safe to drive, don't use the form — call.

Right: four fields only — Name (required), Phone (`type="tel"`, required), Vehicle, What's it doing?  (`textarea`, 3 rows). Labels sit above inputs (14px/700, `#3a4552`), 13px gap between fields. Focus: `border-color: --link` + `outline: 2px solid #cfe0ef`. Submit is full-width accent, 56px. A 13.5px privacy line sits under the button.

Placeholders model good answers rather than repeating the label: `2015 Honda Civic, 118k miles`, `Grinding noise from the front when I brake`.

**Success state:** the form is replaced by a bordered green-tinted confirmation block (`#bdd8c2` border, `#f3f9f4` fill, 6px radius, 20px padding): a bold acknowledgement, then restated callback expectation and the phone number again. In `index.html` this is a client-side swap (`hidden` toggled). Wire the real POST and preserve the same two-state behavior.

Field names for the handler: `name`, `phone`, `vehicle`, `problem`.

### 11. Footer
Navy, `34px 18px 40px`. Four columns (`minmax(200px, 1fr)`, 26px gap):
1. Shop name (18px/800, white), years in city, owner name
2. "PHONE" label → number as a 21px/800 white `tel:` link → "or text us" `sms:` link
3. "ADDRESS" label → address → Directions link
4. "HOURS" label → three `space-between` rows, max-width 225px, times in white

Then a `1px #1d3c5a` rule, `26px` above / `16px` below, and a 13px `#8ba4bc` legal row: copyright, **state inspection station license number**, certifications + warranty.

The license number matters — it's a real, checkable credential that template sites never have.

### 12. Sticky call bar (mobile only)
`position: fixed; bottom: 0; z-index: 50`, `9px` padding, `9px` gap, `rgba(255,255,255,0.95)` + `backdrop-filter: blur(8px)`, 1px top border `#cfd7e0`.

Two buttons: **Call** (accent fill, `flex: 2 1 0`, 54px, `☎ Call (512) 555-0147`) and **Book** (white, `1.5px solid --navy`, `flex: 1 1 0`, 54px, anchors to `#book`).

`body { padding-bottom: 74px }` reserves the space. **Both the padding and the bar are removed at ≥860px** — don't leave a phantom gap on desktop.

---

## Interactions & behavior

Deliberately minimal. Everything here is CSS unless noted.

| Interaction | Behavior |
|-------------|----------|
| Phone tap (anywhere) | `tel:+15125550147` — 6 places: header, hero, form copy, footer, sticky bar, and (optional) utility strip |
| Text us | `sms:+15125550147` |
| Nav links | Native in-page anchors to `#services`, `#reviews`, `#location`, `#book` |
| Directions | New-tab-safe Google Maps directions URL |
| Button hover | `filter: brightness(1.08)` on accent fills; background or border-color shift on outline/white buttons |
| Nav hover | `--ink` → `--link` |
| Input focus | Border to `--link`, `2px solid #cfe0ef` outline |
| Form submit | **JS:** `preventDefault`, hide form, reveal confirmation. Replace with a real POST. |
| Responsive | All breakpoint behavior via `auto-fit`/`minmax` grids and flex wrapping. The only media query is the 860px nav/sticky-bar swap. |

No scroll animations, no reveal-on-scroll, no carousels, no accordions, no modals, no smooth-scroll hijacking. Native anchor jumps are fine and fast.

## State management

There is essentially none. One boolean:

- `formSubmitted: false | true` — swaps the booking form for the confirmation block.

If you implement the live open/closed indicator, add:
- `isOpen: boolean` — derived from the shop's hours **in the shop's timezone**, not the visitor's. Recompute on mount; re-check on an interval only if you care about the transition mid-visit.

Everything else is static content. It should be data, not markup: put the business details in one object/JSON/CMS record and template the page from it (the design-reference prototype does exactly this — see `SHOP` in `design-reference/Auto Repair Shop Site.dc.html`).

## Accessibility

- Contrast: all body and UI text meets 4.5:1 against its background; accent `#c02a1e` on white is 5.9:1, white on `#c02a1e` is 5.9:1, white on navy `#0b2136` is 16:1.
- Every `<img>` has a real `alt`. The map `<iframe>` has a `title`.
- Every input has an associated `<label>` (label wraps the control).
- Focus is visible on inputs (outline, not `outline: none`). Add an equivalent `:focus-visible` treatment to buttons and links if the target codebase doesn't already.
- Heading order is `h1` once, then `h2` per section. Don't skip levels when adding sections.
- Star ratings are decorative glyphs next to the numeric rating in text — screen readers get "4.8 · 127 Google reviews" either way, but add `aria-hidden="true"` on the glyph runs if you want it clean.

## SEO

- `<title>`: `{Shop Name} — Auto Repair in {City, State}`
- `<meta name="description">`: services + city + phone, under 160 chars
- **`AutoRepair` JSON-LD** in `<head>`: name, telephone (E.164), full `PostalAddress`, `openingHours` in schema syntax, `aggregateRating`, `priceRange`. Keep this in sync with the visible content — Google penalizes ratings in markup that don't appear on the page.
- The address, phone, and hours should match the shop's Google Business Profile **character for character**.

## Assets

| Asset | Source | Notes |
|-------|--------|-------|
| Hero — cars on lifts | Unsplash `photo-1767681092416` | **Placeholder.** Replace with a real wide shot of the shop's bays. |
| Owner portrait | Unsplash `photo-1676018366904` | **Placeholder.** Replace with the actual owner at the counter. |
| Gallery 1 — car on lift | Unsplash `photo-1702146713858` | Placeholder |
| Gallery 2 — service bays | Unsplash `photo-1618312980096` | Placeholder |
| Gallery 3 — brake work | Unsplash `photo-1702146713922` | Placeholder |
| Public Sans | Google Fonts | Weights 400/500/600/700/800 |
| Map | OpenStreetMap embed | No API key, no billing, no quota |

Unsplash images are free for commercial use without attribution, loaded via their CDN with `auto=format&fit=crop&w=…&q=70`.

**Replace the stock photos.** Five phone photos from the owner — the bays, the lot, the counter, the owner, a car on a lift — will outperform any stock imagery on this specific page, because the entire design is arguing "we are a real place with real people." Self-host the real photos as WebP/AVIF and drop the Unsplash CDN dependency entirely.

No icon font, no SVG icon set. The two glyphs used (`☎` phone, `★` star) are Unicode characters. Keep it that way, or swap in inline SVG — do not add an icon library for two glyphs.

## Swapping in a real shop

Everything in `index.html` that is shop-specific is either in the JSON-LD block at the top or in the visible markup. To reuse:

1. **Shop name** — header, footer, `<title>`, JSON-LD (4 places)
2. **Initials** — the 42×42 header tile
3. **Phone** — display text in 6 places **and** every `tel:` / `sms:` href, **and** JSON-LD `telephone` (E.164: `+15125550147`)
4. **Address** — utility strip, location section, footer, JSON-LD, and both `maps/dir` URLs (url-encoded)
5. **Cross-street / parking note** — location section
6. **Hours** — utility strip summary, location table, footer table, JSON-LD `openingHours`
7. **Years / opened year** — header subtitle, trust bar, footer
8. **Rating + review count** — hero, reviews heading, JSON-LD, Google link
9. **Certifications** — trust badges (only real ones)
10. **Warranty** — trust bar, footer
11. **License number** — footer legal line
12. **Services + prices** — six service rows
13. **Specials / financing / amenities** — three cards
14. **Owner name, role, note, photo**
15. **Three reviews** — verbatim, with names and vehicles
16. **Service area** — neighborhood and town list
17. **Accent color** — `--accent` on `:root`

If you're building more than one of these, that list is the schema. Make it a data file and template the page — don't fork the HTML per shop.

## What to wire up before launch

1. **Form handler.** Field names: `name`, `phone`, `vehicle`, `problem`. Options, cheapest first: Formspree / Netlify Forms / Cloudflare Worker → email or SMS to the shop. Add a honeypot field or Turnstile; auto shop forms attract spam.
2. **Real photos.** See above.
3. **Call tracking**, if the shop wants attribution: a tracking number that forwards, or a `gtag` event on `tel:` clicks. Don't let it slow the page.
4. **Analytics**, something light — Plausible, Fathom, or Cloudflare Web Analytics. Not GA4 + Tag Manager on a page with this budget.
5. **Verify NAP consistency** against the Google Business Profile.
6. **`<link rel="canonical">`** and a favicon.

## Files in this bundle

```
design_handoff_auto_repair_site/
├── README.md                                     ← this document
├── index.html                                    ← standalone static implementation, ship-ready
└── design-reference/
    ├── Auto Repair Shop Site.dc.html             ← the design prototype (data-driven; SHOP object)
    └── support.js                                ← runtime the prototype needs to render
```

`index.html` opens in any browser with no build step and no server. The `design-reference/` prototype needs both of its files side by side; it's included because its `SHOP` object is the cleanest statement of the content schema, and its logic class shows the intended open/closed and form behavior.

## Copy voice — read this before editing any text

The copy is the design. Every line is written the way a mechanic talks, not the way an agency writes:

- **Concrete over superlative.** "Traced to the actual cause, not a guessed part" — not "expert diagnostics."
- **Numbers wherever possible.** "about 30 minutes," "8 miles," "within the hour," "out in 20 minutes."
- **Name the objection, then answer it.** Financing card, amenities card, the "don't fill this out, call us" escape hatch.
- **Admit when work isn't needed.** "We'll tell you it can wait" is the single most trust-building line on the page.
- **No exclamation marks. No "we're passionate about." No "your trusted partner." No emoji.**

If you rewrite copy for a different shop, keep the register. Polishing this into marketing language will measurably hurt the thing the page exists to do.
