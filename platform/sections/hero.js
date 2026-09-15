import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 2 -- the hero. One job: put the phone number under a thumb.
 *
 * The number is IN the Call Now label rather than hidden behind it, because a
 * visible number is also a number someone can read out to a passenger.
 */
export default {
  id: 'hero',

  css() {
    return `
  .hero { background: var(--dark); color: #fff; }
  .hero-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .hero-text { padding: 34px var(--gutter) 38px; }
  /* With no photo the grid collapses to one full-width column, so the
     headline needs the cap the image column used to give it. */
  .hero--nomedia .hero-text { max-width: 640px; }
  .hero-lede { font-size: 17.5px; line-height: 1.5; color: var(--on-dark); margin: 0 0 14px; max-width: 48ch; text-wrap: pretty; }
  .hero-rating { font-size: 15px; color: var(--star-on-dark); font-weight: 600; margin-bottom: 22px; }
  .hero-actions { display: flex; flex-direction: column; gap: 9px; max-width: 420px; }
  .hero-row { display: flex; gap: 9px; }
  .hero-fine { margin-top: 16px; font-size: 14.5px; color: var(--on-dark-faint); }
  .hero-media { min-height: 260px; background: var(--dark-tint); }
  .hero-media img { width: 100%; height: 100%; min-height: 260px; object-fit: cover; }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    const { rating } = data;
    const photo = options.photo ?? config.photos.hero;
    const finePrint = text('heroFinePrint', '');

    return html`<section class="hero${photo ? '' : ' hero--nomedia'}">
  <div class="wrap" style="padding:0">
    <div class="hero-grid">
      <div class="hero-text">
        <h1 style="margin-bottom:12px">${text('headline', `Auto repair in ${config.business.city}`)}</h1>
        <p class="hero-lede">${text('tagline', '')}</p>
        ${rating.value ? html`<div class="hero-rating">
          <span aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span> ${rating.value} &middot; ${rating.count} ${text('reviewSource', 'Google reviews')}
        </div>` : ''}
        <div class="hero-actions">
          <a class="btn btn-call" href="${data.phoneHref}"><span aria-hidden="true" style="font-size:18px">&#9742;</span> ${text('callNow', 'Call Now')} &middot; ${data.phone}</a>
          <div class="hero-row">
            <a class="btn btn-book" href="#book">${text('bookCta', 'Book an Appointment')}</a>
            ${data.smsHref ? html`<a class="btn btn-text" href="${data.smsHref}">${text('textCta', 'Text us')}</a>` : ''}
          </div>
        </div>
        ${finePrint ? html`<div class="hero-fine">${finePrint}</div>` : ''}
      </div>
      ${photo ? html`<div class="hero-media">
        <img src="${photo}" alt="${config.photos.heroAlt || ''}" fetchpriority="high">
      </div>` : ''}
    </div>
  </div>
</section>`;
  },
};
