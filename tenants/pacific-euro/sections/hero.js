import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * Pacific Euro's hero, replacing the platform's.
 *
 * Same id, so it wins for this tenant and this tenant only. It keeps the
 * platform hero's optional two-column photo layout but adds a marque strip
 * the platform hero has no concept of -- what a German-car owner scans for
 * first -- and drops the eyebrow line above the headline when the tenant
 * sets one. With no `photos.hero` configured the text column still spans the
 * full width, same as the platform default.
 *
 * Everything else still comes from the platform: tokens, buttons, the wrap.
 */
export default {
  id: 'hero',

  css() {
    return `
  .hero { background: var(--dark); color: #fff; }
  .hero-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .hero-text { padding: 40px var(--gutter) 44px; }
  .hero--nomedia .hero-text { max-width: 640px; }
  .hero-eyebrow {
    font-size: 12.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--on-dark-faint); margin-bottom: 14px;
  }
  .hero-lede { font-size: 17.5px; line-height: 1.5; color: var(--on-dark); margin: 0 0 16px; max-width: 48ch; text-wrap: pretty; }
  .hero-rating { font-size: 15px; color: var(--star-on-dark); font-weight: 600; margin-bottom: 22px; }
  .hero-actions { display: flex; flex-direction: column; gap: 9px; max-width: 420px; }
  .hero-row { display: flex; gap: 9px; }
  .hero-fine { margin-top: 16px; font-size: 14.5px; color: var(--on-dark-faint); }
  .hero-marques {
    margin-top: 34px; padding-top: 20px; border-top: 1px solid var(--dark-rule);
    display: flex; flex-wrap: wrap; gap: 10px 26px;
    font-size: 15px; font-weight: 600; color: var(--on-dark-muted);
  }
  .hero-media { min-height: 260px; background: var(--dark-tint); }
  .hero-media img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    const marques = config.extra?.marques || [];
    const photo = options.photo ?? config.photos.hero;

    return html`<section class="hero${photo ? '' : ' hero--nomedia'}">
  <div class="wrap" style="padding:0">
    <div class="hero-grid">
      <div class="hero-text">
        ${text('heroEyebrow', '') ? html`<div class="hero-eyebrow">${text('heroEyebrow', '')}</div>` : ''}
        <h1 style="margin-bottom:12px">${text('headline', '')}</h1>
        <p class="hero-lede">${text('tagline', '')}</p>
        ${data.rating.value ? html`<div class="hero-rating">
          <span aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${data.rating.value} &middot; ${data.rating.count} ${text('reviewSource', 'Google reviews')}
        </div>` : ''}
        <div class="hero-actions">
          <a class="btn btn-call" href="${data.phoneHref}" data-place="hero"><span aria-hidden="true" style="font-size:18px">&#9742;</span> ${text('callNow', 'Call Now')} &middot; ${data.phone}</a>
          <div class="hero-row">
            <a class="btn btn-book" href="#book">${text('bookCta', 'Book an Appointment')}</a>
            ${data.smsHref ? html`<a class="btn btn-text" href="${data.smsHref}">${text('textCta', 'Text us')}</a>` : ''}
          </div>
        </div>
        ${text('heroFinePrint', '') ? html`<div class="hero-fine">${text('heroFinePrint', '')}</div>` : ''}
        ${marques.length ? html`<div class="hero-marques">
          ${marques.map((marque) => html`<span>${marque}</span>`)}
        </div>` : ''}
      </div>
      ${photo ? html`<div class="hero-media">
        <img src="${photo}" alt="${config.photos.heroAlt || ''}" fetchpriority="high">
      </div>` : ''}
    </div>
  </div>
</section>`;
  },
};
