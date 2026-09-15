import { html } from '../core/html.js';

/**
 * Section 5 -- the offer card plus however many plain cards the tenant lists.
 *
 * These answer the three objections that actually stop a call: too expensive,
 * can't afford it right now, I can't be without my car.
 */
export default {
  id: 'specials',

  css() {
    return `
  .specials { padding-top: 0; padding-bottom: 0; margin-top: 26px; }
  .specials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); gap: 14px; align-items: start; }
  .special {
    border: 2px dashed var(--special-border); background: var(--special-fill);
    border-radius: var(--radius-lg); padding: 18px;
  }
  .special .eyebrow { color: var(--accent); letter-spacing: 0.11em; font-weight: var(--w-bold); margin-bottom: 7px; }
  .special-title { font-weight: var(--w-bold); font-size: 19px; line-height: 1.25; margin-bottom: 6px; }
  .special-fine { font-size: 13px; color: var(--ink-quiet); margin-top: 9px; }`;
  },

  render({ config }) {
    const { special, cards } = config;
    if (!special.title && !cards.length) return html``;

    return html`<section class="wrap specials">
  <div class="specials-grid">
    ${special.title ? html`<div class="special">
      <div class="eyebrow">${special.eyebrow}</div>
      <div class="special-title">${special.title}</div>
      ${special.body ? html`<p style="font-size:15.5px; color:var(--ink-2); margin:0">${special.body}</p>` : ''}
      ${special.fine ? html`<div class="special-fine">${special.fine}</div>` : ''}
    </div>` : ''}
    ${cards.map((card) => html`<div class="card">
      <h3>${card.title}</h3>
      <p>${card.body}</p>
    </div>`)}
  </div>
</section>`;
  },
};
