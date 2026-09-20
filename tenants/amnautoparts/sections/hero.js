import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts' hero, replacing the platform's.
 *
 * The stock hero's second and third buttons are "Book an Appointment" and
 * "Text us" -- neither makes sense for a parts manufacturer with no
 * storefront and one channel (WhatsApp). This keeps the layout shape (call
 * button, secondary row, fine print) but reduces to a single WhatsApp CTA
 * plus a same-page link to the product categories, and swaps the follower
 * count in for a star rating this tenant doesn't have.
 */
export default {
  id: 'hero',

  css() {
    return `
  .hero { background: var(--dark); color: #fff; }
  .hero-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .hero-text { padding: 34px var(--gutter) 38px; }
  .hero--nomedia .hero-text { max-width: 640px; }
  .hero-lede { font-size: 17.5px; line-height: 1.5; color: var(--on-dark); margin: 0 0 14px; max-width: 48ch; text-wrap: pretty; }
  .hero-proof { font-size: 15px; color: var(--star-on-dark); font-weight: 600; margin-bottom: 22px; }
  .hero-actions { display: flex; flex-direction: column; gap: 9px; max-width: 420px; }
  .hero-row { display: flex; gap: 9px; }
  .hero-fine { margin-top: 16px; font-size: 14.5px; color: var(--on-dark-faint); }
  .hero-media { min-height: 260px; background: var(--dark-tint); }
  .hero-media img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    const photo = options.photo ?? config.photos.hero;
    const proof = text('heroProof', '');

    return html`<section class="hero${photo ? '' : ' hero--nomedia'}">
  <div class="wrap" style="padding:0">
    <div class="hero-grid">
      <div class="hero-text">
        <h1 style="margin-bottom:12px">${text('headline', '')}</h1>
        <p class="hero-lede">${text('tagline', '')}</p>
        ${proof ? html`<div class="hero-proof">${proof}</div>` : ''}
        <div class="hero-actions">
          <a class="btn btn-call" href="${data.phoneHref}" data-place="hero"><span aria-hidden="true" style="font-size:18px">&#128172;</span> ${text('callNow', 'Chat on WhatsApp')}</a>
          <div class="hero-row">
            <a class="btn btn-book" href="#catalog">${text('bookCta', 'View Products')}</a>
          </div>
        </div>
        ${text('heroFinePrint', '') ? html`<div class="hero-fine">${text('heroFinePrint', '')}</div>` : ''}
      </div>
      ${photo ? html`<div class="hero-media">
        <img src="${photo}" alt="${config.photos.heroAlt || ''}" fetchpriority="high">
      </div>` : ''}
    </div>
  </div>
</section>`;
  },
};
