/**
 * Development server.
 *
 * Resolves the tenant the same way production does -- by Host header -- so the
 * multi-tenant routing is exercised locally rather than assumed. Three ways to
 * reach a tenant:
 *
 *   http://vaughn-auto.localhost:4000/   subdomain matches the slug
 *   http://localhost:4000/t/vaughn-auto/ explicit path, for hosts without
 *                                        wildcard DNS
 *   a real domain from tenant.json, pointed at this host
 *
 * Nothing is cached. Every request re-reads the tenant's config, theme and
 * sections, so an edit shows up on reload.
 */

import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { renderPage } from './core/render.js';
import { createStore } from './build.js';
import { esc } from './core/html.js';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const send = (res, status, body, type = 'text/html; charset=utf-8') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
};

function errorPage(title, detail) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;margin:0;padding:40px;color:#1c2229}
h1{font-size:18px;margin:0 0 12px}pre{white-space:pre-wrap;background:#f2f5f8;padding:16px;border-radius:6px;border:1px solid #dbe1e8}
a{color:#0f4c81}</style></head><body><h1>${esc(title)}</h1><pre>${esc(detail)}</pre></body></html>`;
}

async function indexPage(store) {
  const slugs = await store.list();
  const rows = await Promise.all(slugs.map(async (slug) => {
    const { config } = await store.load(slug, { strict: false });
    return `<li><a href="/t/${esc(slug)}/">${esc(config.business.name)}</a> <code>${esc(slug)}</code> ${
      config.domains.map((d) => `<code>${esc(d)}</code>`).join(' ')}</li>`;
  }));
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>shopfront dev</title>
<style>body{font:15px/1.7 system-ui,sans-serif;margin:0;padding:40px;color:#1c2229}
h1{font-size:20px;margin:0 0 6px}p{color:#5c6874;margin:0 0 20px}ul{padding-left:18px;max-width:720px}
code{background:#f2f5f8;padding:1px 5px;border-radius:4px;font-size:13px}a{color:#0f4c81}</style></head>
<body><h1>shopfront</h1><p>Tenants resolve by Host header. Subdomains of <code>localhost</code> work in most browsers.</p>
<ul>${rows.join('')}</ul></body></html>`;
}

function serveFile(res, file) {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  createReadStream(file).pipe(res);
}

export function serve(root, { port = 4000, host = '0.0.0.0', log = console.log } = {}) {
  const store = createStore(root);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    try {
      // Path-prefix form: /t/<slug>/rest
      let slug = null;
      const prefixed = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
      if (prefixed) {
        slug = prefixed[1];
        pathname = prefixed[2] || '/';
      } else {
        slug = url.searchParams.get('tenant') || (await store.resolveHost(req.headers.host));
      }

      if (!slug) {
        return send(res, pathname === '/' ? 200 : 404, await indexPage(store));
      }

      const slugs = await store.list();
      if (!slugs.includes(slug)) {
        return send(res, 404, errorPage('No such tenant', `"${slug}" is not in tenants/.\n\nAvailable: ${slugs.join(', ')}`));
      }

      const tenant = await store.load(slug, { strict: false });

      if (pathname !== '/' && pathname !== '/index.html') {
        const asset = tenant.publicDir
          ? path.join(tenant.publicDir, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''))
          : null;
        if (asset && asset.startsWith(tenant.publicDir) && existsSync(asset) && statSync(asset).isFile()) {
          return serveFile(res, asset);
        }
        return send(res, 404, errorPage('Not found', `${pathname} is not in tenants/${slug}/public/`));
      }

      if (tenant.configErrors.length) {
        return send(res, 500, errorPage(`tenants/${slug}/tenant.json is invalid`, tenant.configErrors.join('\n')));
      }

      const { html, warnings } = renderPage(tenant);
      for (const warning of warnings) log(`  ! ${slug}: ${warning}`);
      return send(res, 200, html);
    } catch (error) {
      log(`  x ${error.message}`);
      return send(res, 500, errorPage(error.constructor.name, error.stack || error.message));
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      log(`\n  Port ${port} is already in use. Try: npm run dev -- --port ${port + 1}\n`);
      process.exitCode = 1;
      return;
    }
    throw error;
  });

  server.listen(port, host, async () => {
    const slugs = await store.list();
    log(`\n  shopfront dev  http://localhost:${port}\n`);
    for (const slug of slugs) {
      log(`    http://${slug}.localhost:${port}/   ·   http://localhost:${port}/t/${slug}/`);
    }
    log('');
  });

  return server;
}
