/**
 * Tenant loading.
 *
 * `TenantStore` is the seam between the platform and wherever tenants actually
 * live. `FileTenantStore` reads `tenants/<slug>/` off disk, which is the right
 * answer while tenants are onboarded by a human and reviewed in a pull request.
 * A `DbTenantStore` implementing the same three methods -- list, load,
 * resolveHost -- drops in without touching a section or the renderer.
 *
 *   tenants/<slug>/
 *     tenant.json      content + layout + domains   (required)
 *     theme.json       design token overrides       (optional)
 *     overrides.css    last-word CSS for this tenant(optional)
 *     hooks.js         per-tenant code hooks        (optional)
 *     sections/*.js    section overrides + custom   (optional)
 *     public/          assets copied to the site root (optional)
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { validateTenant } from './schema.js';
import { resolveTheme } from './tokens.js';
import { SectionRegistry } from './registry.js';

export class TenantNotFound extends Error {
  constructor(id) {
    super(`No tenant "${id}"`);
    this.name = 'TenantNotFound';
    this.tenantId = id;
  }
}

export class TenantConfigError extends Error {
  constructor(slug, errors) {
    super(`tenants/${slug}/tenant.json is invalid:\n  - ${errors.join('\n  - ')}`);
    this.name = 'TenantConfigError';
    this.slug = slug;
    this.errors = errors;
  }
}

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

/**
 * Import a tenant's module fresh every time. The dev server relies on this to
 * pick up an edit to a section without a restart.
 */
async function importFresh(file) {
  const url = pathToFileURL(file).href + `?v=${Date.now()}-${Math.random()}`;
  const mod = await import(url);
  return mod.default ?? mod;
}

/**
 * Register every section module in a directory, re-imported fresh. `index.js`
 * is skipped -- it is the barrel, not a section.
 *
 * Used for a tenant's own sections/, and by the dev server for the platform's,
 * so editing either shows up on reload without a restart.
 */
export async function loadSectionsFrom(dir, origin, registry) {
  if (!existsSync(dir)) return registry;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.js') && f !== 'index.js').sort();
  for (const file of files) {
    const section = await importFresh(path.join(dir, file));
    const id = section.id || path.basename(file, '.js');
    registry.register({ ...section, id }, `${origin}/${file}`);
  }
  return registry;
}

export class FileTenantStore {
  constructor(root, { baseRegistry } = {}) {
    this.root = root;
    this.baseRegistry = baseRegistry || new SectionRegistry();
  }

  async list() {
    if (!existsSync(this.root)) return [];
    const entries = await readdir(this.root, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
      .map((e) => e.name)
      .sort();
  }

  dirFor(slug) {
    return path.join(this.root, slug);
  }

  async load(slug, { strict = true } = {}) {
    const dir = this.dirFor(slug);
    const configFile = path.join(dir, 'tenant.json');
    if (!existsSync(configFile)) throw new TenantNotFound(slug);

    const { config, errors } = validateTenant(await readJson(configFile));
    if (errors.length && strict) throw new TenantConfigError(slug, errors);

    const themeFile = path.join(dir, 'theme.json');
    const themeInput = existsSync(themeFile) ? await readJson(themeFile) : {};
    const theme = resolveTheme(themeInput);

    const registry = this.baseRegistry.clone();
    await loadSectionsFrom(path.join(dir, 'sections'), `tenants/${slug}/sections`, registry);

    const hooksFile = path.join(dir, 'hooks.js');
    const hooks = existsSync(hooksFile) ? await importFresh(hooksFile) : {};

    const cssFile = path.join(dir, 'overrides.css');
    const overridesCss = existsSync(cssFile) ? await readFile(cssFile, 'utf8') : '';

    const publicDir = path.join(dir, 'public');
    const hasPublic = existsSync(publicDir) && (await stat(publicDir)).isDirectory();

    return {
      slug,
      dir,
      config,
      theme,
      themeInput,
      registry,
      hooks,
      overridesCss,
      publicDir: hasPublic ? publicDir : null,
      configErrors: errors,
    };
  }

  async loadAll(options) {
    const slugs = await this.list();
    return Promise.all(slugs.map((slug) => this.load(slug, options)));
  }

  /** host -> slug. Matches an explicit domain first, then `<slug>.<anything>`. */
  async resolveHost(host) {
    const name = String(host || '').split(':')[0].toLowerCase().replace(/^www\./, '');
    const slugs = await this.list();

    for (const slug of slugs) {
      const { config } = await this.load(slug, { strict: false });
      const domains = (config.domains || []).map((d) => String(d).toLowerCase().replace(/^www\./, ''));
      if (domains.includes(name)) return slug;
    }

    const sub = name.split('.')[0];
    if (slugs.includes(sub)) return sub;

    return null;
  }
}
