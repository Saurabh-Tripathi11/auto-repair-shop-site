#!/usr/bin/env node
/**
 * shopfront — white-label site platform.
 *
 *   shopfront build [slug]    render every tenant (or one) into dist/
 *   shopfront serve [--port]  dev server, tenant resolved by Host header
 *   shopfront check [slug]    validate config, contrast and rendered output
 *   shopfront new <slug>      scaffold a tenant
 *   shopfront list            show tenants and their domains
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, createStore } from './build.js';
import { serve } from './serve.js';
import { check } from './check.js';
import { scaffold } from './scaffold.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split('=');
      flags[key] = inline ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true);
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

const USAGE = `
  shopfront — white-label multi-tenant site platform

    shopfront build [slug]        render tenants into dist/
      --out <dir>                 output directory (default: dist)
      --no-clean                  keep existing output

    shopfront serve               dev server; tenant resolved by Host header
      --port <n>                  default 4000

    shopfront check [slug]        validate config, contrast and output
    shopfront new <slug>          scaffold a new tenant
    shopfront list                tenants and their domains
`;

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [command = 'build', arg] = positional;

  switch (command) {
    case 'build': {
      console.log('');
      const { outDir, results } = await build(ROOT, {
        out: flags.out || 'dist',
        only: arg || null,
        clean: flags.clean !== false && !flags['no-clean'],
      });
      const total = results.reduce((sum, r) => sum + r.bytes, 0);
      console.log(`\n  ${results.length} tenant${results.length === 1 ? '' : 's'} -> ${path.relative(ROOT, outDir)}/  (${(total / 1024).toFixed(1)} KB total)\n`);
      break;
    }

    case 'serve':
    case 'dev':
      serve(ROOT, { port: Number(flags.port) || 4000 });
      break;

    case 'check':
    case 'test': {
      console.log('');
      const { errors } = await check(ROOT, { only: arg || null });
      console.log('');
      if (errors) process.exitCode = 1;
      break;
    }

    case 'new': {
      if (!arg) throw new Error('Usage: shopfront new <slug>');
      console.log('');
      await scaffold(ROOT, arg);
      console.log('');
      break;
    }

    case 'list': {
      const store = createStore(ROOT);
      const slugs = await store.list();
      console.log('');
      for (const slug of slugs) {
        const { config, configErrors } = await store.load(slug, { strict: false });
        console.log(`  ${slug.padEnd(24)} ${config.business.name.padEnd(28)} ${config.domains.join(', ')}${configErrors.length ? `  (${configErrors.length} config errors)` : ''}`);
      }
      console.log('');
      break;
    }

    case 'help':
    case '--help':
    case '-h':
      console.log(USAGE);
      break;

    default:
      console.error(`Unknown command "${command}"`);
      console.log(USAGE);
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\n  ${error.message}\n`);
  process.exitCode = 1;
});
