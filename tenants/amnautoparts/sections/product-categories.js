import { html, raw } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts only. Replaces the stock `services` section.
 *
 * `services` is shaped for a repair shop's priced line items -- a
 * manufacturer selling by catalog has no per-item price to show up front,
 * and inventing one would be worse than showing none.
 *
 * Each product line gets a drawn technical illustration rather than a
 * photograph. Two reasons: there is no photograph of this company's actual
 * parts to use, and a generic workshop stock photo on a product card
 * advertises a part the company may not make. Line art of the part itself is
 * honest about being a diagram, renders at any size, needs no network, and
 * reads as deliberate on a technical B2B page where stock photography reads
 * as filler.
 *
 * Illustrations are keyed by `extra.categories[].art`; an unknown or missing
 * key falls back to no illustration rather than the wrong one.
 */

const ART = {
  // Assorted O-rings: nested rings at descending diameters, the way an
  // assortment case actually presents them.
  oring: `<svg viewBox="0 0 120 120" role="img" aria-label="Assorted O-rings at descending diameters" focusable="false">
    <circle cx="42" cy="42" r="28" fill="none" stroke="currentColor" stroke-width="7" opacity="0.9"/>
    <circle cx="86" cy="40" r="17" fill="none" stroke="currentColor" stroke-width="6" opacity="0.72"/>
    <circle cx="40" cy="90" r="19" fill="none" stroke="currentColor" stroke-width="6" opacity="0.72"/>
    <circle cx="85" cy="84" r="11" fill="none" stroke="currentColor" stroke-width="5" opacity="0.55"/>
    <circle cx="104" cy="108" r="7" fill="none" stroke="currentColor" stroke-width="4" opacity="0.4"/>
  </svg>`,

  // Valve stem seal on its guide, with the installer sleeve above it --
  // the actual geometry the tool exists to work on.
  valveseal: `<svg viewBox="0 0 120 120" role="img" aria-label="Valve stem seal and installer sleeve" focusable="false">
    <rect x="52" y="6" width="16" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="5" opacity="0.5"/>
    <path d="M44 44 h32 a5 5 0 0 1 5 5 v14 a5 5 0 0 1 -5 5 h-32 a5 5 0 0 1 -5 -5 v-14 a5 5 0 0 1 5 -5 z"
          fill="none" stroke="currentColor" stroke-width="6"/>
    <line x1="39" y1="56" x2="81" y2="56" stroke="currentColor" stroke-width="3" opacity="0.55"/>
    <line x1="60" y1="68" x2="60" y2="96" stroke="currentColor" stroke-width="6" opacity="0.85"/>
    <path d="M40 96 q20 18 40 0" fill="none" stroke="currentColor" stroke-width="6" opacity="0.85"/>
  </svg>`,
};

export default {
  id: 'product-categories',

  css() {
    return `
  .categories { padding-top: var(--section-pad); padding-bottom: var(--section-pad); }
  .categories-head { max-width: 62ch; }
  .categories-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 18px; margin-top: 32px;
  }
  .category-card {
    display: flex; flex-direction: column;
    border: 1px solid var(--line); border-radius: var(--radius-lg);
    background: var(--surface); overflow: hidden;
  }
  .category-art {
    display: flex; align-items: center; justify-content: center;
    padding: 30px 20px; background: var(--wash);
    border-bottom: 1px solid var(--line); color: var(--accent);
  }
  .category-art svg { width: 108px; height: 108px; display: block; }
  .category-body { padding: 20px; }
  .category-name { font-weight: 700; font-size: 18.5px; margin-bottom: 7px; }
  .category-line { color: var(--ink-2); font-size: 16px; text-wrap: pretty; }
  .category-note {
    margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line-2);
    font-size: 14px; color: var(--ink-3);
  }
  .categories-cta {
    margin-top: 28px; padding: 18px 20px;
    background: var(--wash); border-left: 3px solid var(--accent); border-radius: var(--radius-md);
    font-size: 16px; color: var(--ink-2);
  }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const categories = config.extra?.categories || [];
    if (!categories.length) return html``;

    return html`<section id="catalog" class="wrap categories">
  <div class="categories-head">
    <h2 style="margin-bottom:8px">${text('categoriesHeading', 'What we make')}</h2>
    ${text('categoriesLede', '') ? html`<p class="lede" style="margin:0">${text('categoriesLede', '')}</p>` : ''}
  </div>
  <div class="categories-grid">
    ${categories.map((category) => html`<div class="category-card">
      ${ART[category.art] ? html`<div class="category-art">${raw(ART[category.art])}</div>` : ''}
      <div class="category-body">
        <div class="category-name">${category.name}</div>
        ${category.line ? html`<div class="category-line">${category.line}</div>` : ''}
        ${category.note ? html`<div class="category-note">${category.note}</div>` : ''}
      </div>
    </div>`)}
  </div>
  <p class="categories-cta">${text('categoriesCtaLede', 'Full catalog and pricing on request —')} <a href="${data.phoneHref}" style="font-weight:700">${text('categoriesCtaLink', 'DM us on WhatsApp')}</a>.</p>
</section>`;
  },
};
