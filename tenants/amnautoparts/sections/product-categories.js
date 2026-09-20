import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts only. Replaces the stock `services` section.
 *
 * `services` is shaped for a repair shop's priced line items (name, price,
 * one-line description) -- a manufacturer selling product lines by catalog
 * doesn't have per-item prices to show up front, so forcing this into that
 * schema would mean inventing numbers. This reads from `extra.categories`
 * instead: a name and description per product line, no price field, ending
 * in the same WhatsApp CTA the hero opens with.
 *
 * Registering under a new id rather than overriding `services` means a tenant
 * could use both side by side if it ever needed to; `check.js`'s services
 * check only fires for a tenant whose layout actually uses the stock section.
 */
export default {
  id: 'product-categories',

  css() {
    return `
  .categories { padding-top: var(--section-pad); padding-bottom: 8px; }
  .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 24px; }
  .category-card { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; }
  .category-name { font-weight: 700; font-size: 18px; margin-bottom: 6px; }
  .category-line { color: var(--ink-2); font-size: 16px; }
  .categories-cta { margin-top: 26px; font-size: 16px; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const categories = config.extra?.categories || [];
    if (!categories.length) return html``;

    return html`<section id="catalog" class="wrap categories">
  <h2 style="margin-bottom:6px">${text('categoriesHeading', 'What we make')}</h2>
  ${text('categoriesLede', '') ? html`<p class="lede" style="margin:0; max-width:62ch">${text('categoriesLede', '')}</p>` : ''}
  <div class="categories-grid">
    ${categories.map((category) => html`<div class="category-card">
      <div class="category-name">${category.name}</div>
      ${category.line ? html`<div class="category-line">${category.line}</div>` : ''}
    </div>`)}
  </div>
  <p class="categories-cta">${text('categoriesCtaLede', 'Full catalog and pricing on request —')} <a href="${data.phoneHref}" style="font-weight:700">${text('categoriesCtaLink', 'DM us on WhatsApp')}</a>.</p>
</section>`;
  },
};
