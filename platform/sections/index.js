/**
 * The platform's default sections, in the order the handoff lays them out.
 * A tenant's layout may reorder, omit, repeat or replace any of them.
 */

import utilityStrip from './utility-strip.js';
import header from './header.js';
import hero from './hero.js';
import trustBar from './trust-bar.js';
import services from './services.js';
import specials from './specials.js';
import owner from './owner.js';
import gallery from './gallery.js';
import reviews from './reviews.js';
import location from './location.js';
import booking from './booking.js';
import footer from './footer.js';
import callBar from './call-bar.js';

import { SectionRegistry } from '../core/registry.js';

export const DEFAULT_SECTIONS = [
  utilityStrip, header, hero, trustBar, services, specials,
  owner, gallery, reviews, location, booking, footer, callBar,
];

export function defaultRegistry() {
  return new SectionRegistry().registerAll(DEFAULT_SECTIONS, 'platform');
}
