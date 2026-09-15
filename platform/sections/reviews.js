import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 8 -- reviews, no card chrome.
 *
 * Attribution carries name, vehicle and recency. The vehicle is what makes a
 * review read as real. Reviews must be verbatim -- trim with an ellipsis if
 * they run long, never rewrite.
 */
export default {
  id: 'reviews',

  css() {
    return `
  .reviews-head { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: baseline; margin-bottom: 20px; }
  .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(275px, 1fr)); gap: 18px; }
  .review { display: flex; flex-direction: column; gap: 10px; }
  .review-text { font-size: 16.5px; text-wrap: pretty; }
  .review-by { font-size: 14px; color: var(--ink-3); }
  .review-by b { color: var(--ink); }
  .reviews-link { display: inline-block; margin-top: 22px; font-weight: 700; font-size: 16px; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const { rating } = data;
    if (!config.reviews.length) return html``;

    return html`<section id="reviews" class="wrap sec">
  <div class="reviews-head">
    <h2>${text('reviewsHeading', 'What customers say')}</h2>
    ${rating.value ? html`<span style="font-size:16px; color:var(--ink-2)">
      <span class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      ${rating.value} average, ${rating.count} ${text('reviewSourceLong', 'reviews on Google')}
    </span>` : ''}
  </div>
  <div class="reviews-grid">
    ${config.reviews.map((review) => html`<div class="review">
      <div class="stars" style="font-size:14px" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <div class="review-text">${review.text}</div>
      <div class="review-by">
        <b>${review.name}</b>${[review.vehicle, review.when].filter(Boolean).map((part) => html` &middot; ${part}`)}
      </div>
    </div>`)}
  </div>
  ${rating.count ? html`<a class="reviews-link" href="${data.reviewsUrl}">${text('reviewsLink', `Read all ${rating.count} reviews on Google`)}</a>` : ''}
</section>`;
  },
};
