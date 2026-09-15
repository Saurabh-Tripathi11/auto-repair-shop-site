# shopfront

A white-label platform for independent auto repair shop sites. One design
system, one codebase, one static page per tenant — where each tenant brings
their own content, their own design tokens, and, when they need it, their own
code.

The design it implements is in [`design_handoff_auto_repair_site/`](design_handoff_auto_repair_site/).
That handoff ends with the instruction this repository follows:

> If you're building more than one of these, that list is the schema. Make it a
> data file and template the page — don't fork the HTML per shop.

```
npm run check              # validate every tenant: config, contrast, rendered output
npm run build              # render every tenant into dist/
npm run dev                # dev server, tenant resolved by Host header
npm run new -- <slug>      # scaffold a tenant
```

No dependencies. No build step beyond Node. `npm install` installs nothing
because there is nothing to install.

---

## Why it is built this way

The design carries a hard performance budget: **under 2 seconds to interactive
on a mid-range phone on 4G**, no JS framework, no component library, no
CSS-in-JS runtime. That budget is not decoration — the page exists to get a
stressed person with a broken car to tap a phone number, and every kilobyte
between them and that tap costs conversions.

So the multi-tenancy happens entirely at build time. A tenant's page is one
static HTML file of about 31 KB with no client framework and no hydration. The
only JavaScript that reaches a browser is what the sections in that tenant's
layout ask for — by default the booking form's submit handler, plus an
eight-line "Open now" indicator where a tenant turns it on.

The platform is Node because the render has to run somewhere. Nothing about the
architecture is Node-specific: a section is a function from data to a string.

---

## A tenant

```
tenants/<slug>/
  tenant.json      content, layout and domains             (required)
  theme.json       design token overrides                  (optional)
  overrides.css    last-word CSS for this tenant           (optional)
  hooks.js         per-tenant code hooks                   (optional)
  sections/*.js    section overrides and custom sections   (optional)
  public/          assets served at the tenant's root      (optional)
```

The slug is the directory name. It is also the dev subdomain, so it has to be
lowercase letters, digits and hyphens.

Three tenants ship as examples, and they diverge on purpose:

| | `vaughn-auto` | `northline-collision` | `pacific-euro` |
|---|---|---|---|
| Content | the handoff's shop, verbatim | body shop, insurance-led | German specialist |
| Theme | none — platform defaults | green brand, derived ramp, 2px radii | graphite + orange, square, 1080px, IBM Plex |
| Layout | default | reordered, one custom section | reordered, call bar always on |
| Own code | — | `sections/insurance-claims.js`, `hooks.js` | `sections/hero.js` (override), `overrides.css` |
| Form | local confirmation | POSTs to their own endpoint | local confirmation |

`vaughn-auto` renders the handoff design pixel for pixel with no theme file and
no layout, which is the proof that the defaults are the design rather than an
approximation of it.

---

## The three ways a tenant differs

### 1. Content — `tenant.json`

Everything shop-specific is data. The schema is
[`platform/core/schema.js`](platform/core/schema.js); it validates types, fills
defaults, and **allows unknown keys**, so a custom section can carry its own
content in the same file (the `extra` object is there for exactly that).

Copy is data too. Every string a section shows has a platform default taken from
the handoff, and a tenant overrides one by name:

```json
"copy": { "servicesHeading": "What we take in" }
```

No fork, no override, just a string. The keys sit next to their defaults in each
section file.

### 2. Design — `theme.json`

Every visual decision in the handoff is a named token with the handoff's exact
value as its default, so a tenant that overrides nothing is byte-identical to
the reference design.

The part that makes this a platform rather than a find-and-replace is the
**derived dark ramp**. The design layers fourteen shades on its navy: hero body
copy, fine print, footer labels, the legal row, the divider rule, the outline
button border. Set one colour:

```json
{ "color": { "dark": "#12261f", "accent": "#16653f" } }
```

and every one of those shades is recomputed at the same ratio along
`dark → white` that the handoff's own values sit at against its navy. Navy
reproduces the original exactly; any other dark colour gets a ramp in the same
proportions. A tenant who sets a shade explicitly keeps theirs.

`npm run check` then verifies the result against WCAG AA. This is not
theoretical: the handoff suggests `#d1601a` as an orange accent alternative, and
the check rates it **3.89:1 on white** — below the floor. `pacific-euro` uses
`#a8481a`, the nearest orange that passes, and says so in its theme file.

### 3. Code — `sections/`, `hooks.js`, `overrides.css`

A page is an ordered list of section ids. The registry maps an id to the module
that renders it: platform defaults first, then the tenant's own `sections/`
directory over the top.

```
tenants/acme/sections/hero.js       -> replaces the platform hero, for acme only
tenants/acme/sections/warranty.js   -> a section only acme has
```

A section module is a plain object:

```js
export default {
  id: 'hero',
  render(ctx) { return html`...` },  // required
  css(ctx)    { return '...' },      // optional, emitted once per id
  head(ctx)   { return html`...` },  // optional, goes in <head>
  script(ctx) { return '...' },      // optional, joins the page's one script
};
```

`ctx` is `{ config, data, theme, tenant, options, warn }`. `data` holds the
derived values — `phoneHref`, `directionsUrl`, `initials`, `mapSrc`, the JSON-LD
block — computed once per render so no section re-derives them.

Layout entries take either form:

```json
"layout": ["header", "hero", { "use": "call-bar", "options": { "mode": "always" } }]
```

`hooks.js` covers what does not belong in a section — an analytics tag, an extra
`<head>` element, a derived value:

```js
export default {
  transform({ data }) { return { ...data, callbackWindow: 'the same morning' }; },
  head({ config })    { return html`<script defer src="..."></script>`; },
  styles(ctx)         { return '...'; },
  scripts(ctx)        { return '...'; },
};
```

`overrides.css` is emitted after every section's CSS. It is the escape hatch for
a tweak that does not justify overriding a whole section.

---

## Routing

`FileTenantStore.resolveHost(host)` matches an explicit domain from
`tenant.json` first (ignoring `www.`), then falls back to `<slug>.<anything>`.
The dev server resolves exactly the way production does, so multi-tenant routing
is exercised locally rather than assumed:

```
http://pacificeuro.com/                 a real domain, pointed at the host
http://pacific-euro.localhost:4000/     subdomain matches the slug
http://localhost:4000/t/pacific-euro/   path form, for hosts without wildcard DNS
```

Nothing is cached in dev: every request re-reads the tenant's config, theme and
sections, so an edit shows up on reload.

`npm run build` writes `dist/routes.json` (host → slug) and a `dist/Caddyfile`
that serves each tenant's directory on its own domains with automatic TLS. Any
static host works — each `dist/<slug>/` is a complete site root, with its own
`robots.txt` and `sitemap.xml`.

---

## Deploying

### As one demo link (GitHub Pages)

[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) runs
`npm run check` and `npm run build`, then rearranges `dist/` before publishing
it: one tenant (`ROOT_TENANT` in the workflow's env block) is promoted to the
bare domain, and the directory page `npm run build` writes to `dist/index.html`
moves to `CHECK_PATH` instead, so it stays reachable without sitting at the
root:

```
https://<your-domain>/                     ROOT_TENANT's own page
https://<your-domain>/vaughn-auto/         every tenant still at its own
https://<your-domain>/northline-collision/ path too, unchanged
https://<your-domain>/pacific-euro/
https://<your-domain>/mai/sachin/hoon/     the directory of all tenants
```

Change `ROOT_TENANT` or `CHECK_PATH` at the top of the workflow to pick a
different tenant or move the directory page elsewhere. This rearranging step
is GitHub-Pages-demo-only — `npm run build` itself is untouched, and still
just writes `dist/<slug>/` per tenant plus the directory page.

This is a showcase link, not a production deployment for a real shop — every
tenant other than `ROOT_TENANT` is reachable by path, not by its own domain,
because GitHub Pages binds at most one custom domain per repo. A tenant that
goes live for real gets its own domain via the `Caddyfile` route above instead.

Setup, once:

1. **Make the repo public**, or be on a GitHub plan with private-repo Pages —
   the free tier only serves Pages from public repos. Settings → General →
   Danger Zone → Change visibility.
2. **Turn Pages on**, once: Settings → Pages → Build and deployment → Source →
   **"GitHub Actions"**. The workflow deploys to a Pages site; it can't create
   one — that needs an admin-level token the default `GITHUB_TOKEN` is
   deliberately not given, so this one click has no workflow-side substitute.
3. **Point a domain at it.** Pick a subdomain you're not using for anything
   else (an apex domain replaces whatever is currently live at its root).
   At your DNS provider, add:
   ```
   Type: CNAME   Host: demo   Value: <your-github-username>.github.io
   ```
   This is the same target for a project's Pages site regardless of the repo's
   name — GitHub routes by matching the domain each repo has configured.
4. Push to `main` (or run the workflow manually from the Actions tab —
   "Deploy to GitHub Pages" → Run workflow — to deploy before merging). It
   writes a `CNAME` file into `dist/` from `CUSTOM_DOMAIN` at the top of the
   workflow; change that value to use a different domain, or delete it and
   that step to publish to the default `<username>.github.io/<repo>/` instead.
5. HTTPS provisions itself once DNS resolves and GitHub verifies the domain —
   typically minutes, occasionally longer. Settings → Pages shows the status.

### For real, per tenant

Each `dist/<slug>/` is a complete, dependency-free static site. Deploy it
anywhere that serves static files, on the tenant's own domain: the `Caddyfile`
`npm run build` writes covers a VPS with automatic TLS, or point any static
host (Netlify, Vercel, S3 + CloudFront, Cloudflare Pages) at that one
directory. This is the path for a shop that needs `vaughnauto.com` to actually
be `vaughnauto.com` — GitHub Pages' one-domain-per-repo limit means the demo
setup above can't do that for more than one tenant at a time.

---

## `npm run check`

The guard rail that makes self-serve theming safe. Errors fail the run;
warnings are the list of things standing between a tenant and launch.

**Errors** — config schema violations; contrast below 4.5:1 on any text pair
that carries meaning; a `var(--x)` no token defines; a missing `tel:` link; more
or fewer than one `<h1>`; an `<img>` without `alt` or an `<iframe>` without
`title`; JSON-LD that does not parse or whose rating disagrees with the page; a
rendered `undefined`.

**Warnings** — stock placeholder photography; a 555 sample number; an empty
`hours.schema` (JSON-LD ships without opening hours); a missing licence line;
content configured whose section is not in the layout, so it renders nowhere; a
page over 60 KB.

One warning is true of every tenant, including the reference one:

```
warn  contrast: quiet text on page background is 3.85:1 (#79838f on #ffffff)
```

That is the handoff's own `#79838f`, used for the form's privacy line and the
offer card's fine print. The handoff states that all body and UI text meets
4.5:1; this value does not. It is left at the design's value rather than
silently changed — override `color.inkQuiet` per tenant, or change the default
in [`platform/core/tokens.js`](platform/core/tokens.js), to clear it.

---

## Adding a tenant

```
npm run new -- riverside-motors
```

Writes a complete, valid, obviously-unfilled tenant plus a `CHECKLIST.md` of
what has to be true before launch — the handoff's swap list, as checkboxes.
Then:

```
npm run dev                      # http://riverside-motors.localhost:4000/
npm run check riverside-motors
```

A tenant is reviewable as a pull request, which is the right shape while shops
are onboarded by a person. When that stops being true, `TenantStore`
([`platform/core/tenant.js`](platform/core/tenant.js)) is the seam: `list`,
`load`, `resolveHost`. A database-backed store implementing those three methods
drops in without touching a section or the renderer.

---

## Layout of the repository

```
platform/
  core/
    html.js         tagged-template HTML, escaped by default
    color.js        mixing, luminance, WCAG contrast
    tokens.js       token defaults, theme merge, derived dark ramp
    schema.js       tenant config schema + validator
    derive.js       phone hrefs, directions URL, JSON-LD, SEO defaults
    hours.js        schema.org opening hours, "open now" in the shop's timezone
    copy.js         copy lookup with platform defaults
    registry.js     section registry and layout entries
    stylesheet.js   base CSS, expressed against the tokens
    tenant.js       TenantStore + FileTenantStore
    render.js       tenant -> one HTML document
  sections/         the 13 sections of the handoff design
  build.js  serve.js  check.js  scaffold.js  cli.js
tenants/            one directory per shop
design_handoff_auto_repair_site/   the design this implements
```

---

## Deliberately not here

Worth knowing what you are choosing when you extend this:

- **No admin UI or tenant API.** Tenants are files in a repository, reviewed
  like code. The `TenantStore` seam is where that changes.
- **No image pipeline.** Tenants drop files in `public/`. The handoff wants real
  shop photos at ≤1400px hero and ≤800px gallery, as WebP or AVIF; that
  conversion is currently a human step.
- **No form backend.** `forms.endpoint` points at whatever the shop uses. The
  honeypot field is rendered; the spam check belongs at the handler.
- **No multi-page routing.** Every tenant is one page, because that is what this
  design is. A second page means a `pages` key in the config and a loop in the
  builder — the section registry already supports it.
- **No i18n.** Copy defaults are English and live in the section files.
