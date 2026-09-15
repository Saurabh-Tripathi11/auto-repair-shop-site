import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * Pacific Euro's hero, replacing the platform's.
 *
 * Same id, so it wins for this tenant and this tenant only. The shop has no
 * hero photograph and does not want one -- a stock engine bay would undercut
 * the entire argument of the page -- so the image column is gone and the space
 * goes to the marque list, which is what a German-car owner scans for first.
 *
 * Everything else still comes from the platform: tokens, buttons, the wrap.
 */
export default {
  id: 'hero',

  css() {
    return `
  .hero { background: var(--dark); color: #fff; padding-top: 40px; padding-bottom: 44px; }
  .hero-eyebrow {
    font-size: 12.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--on-dark-faint); margin-bottom: 14px;
  }
  .hero-body { max-width: 62ch; }
  .hero-lede { font-size: 17.5px; line-height: 1.5; color: var(--on-dark); margin: 0 0 16px; text-wrap: pretty; }
  .hero-rating { font-size: 15px; color: var(--star-on-dark); font-weight: 600; margin-bottom: 22px; }
  .hero-actions { display: flex; flex-direction: column; gap: 9px; max-width: 420px; }
  .hero-row { display: flex; gap: 9px; }
  .hero-fine { margin-top: 16px; font-size: 14.5px; color: var(--on-dark-faint); }
  .hero-marques {
    margin-top: 34px; padding-top: 20px; border-top: 1px solid var(--dark-rule);
    display: flex; flex-wrap: wrap; gap: 10px 26px;
    font-size: 15px; font-weight: 600; color: var(--on-dark-muted);
  }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const marques = config.extra?.marques || [];

    return html`<section class="hero">
  <div class="wrap">
    ${text('heroEyebrow', '') ? html`<div class="hero-eyebrow">${text('heroEyebrow', '')}</div>` : ''}
    <div class="hero-body">
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
    </div>
    ${marques.length ? html`<div class="hero-marques">
      ${marques.map((marque) => html`<span>${marque}</span>`)}
    </div>` : ''}
  </div>
</section>`;
  },
};
