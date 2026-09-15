import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 3 -- certifications, years, warranty.
 *
 * Only list certifications the shop actually holds. These are verifiable
 * claims and a visitor who checks one and finds it false is gone.
 */
export default {
  id: 'trust-bar',

  css() {
    return `
  .trust { background: var(--wash); border-bottom: 1px solid var(--line); }
  .trust > .wrap {
    padding-top: 13px; padding-bottom: 13px;
    display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: center;
  }
  .trust-badge {
    border: 1px solid var(--badge-border); background: var(--surface); border-radius: var(--radius-sm);
    padding: 7px 11px; font-size: 13px; font-weight: 700; color: var(--badge-ink); letter-spacing: 0.01em;
  }
  .trust-note { font-size: 14px; color: var(--ink-3); font-weight: 600; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const { business } = config;
    const note = text('trustNote', [
      data.years ? `${data.years} years in business` : '',
      business.warranty ? `${business.warranty} warranty on parts & labor` : '',
    ].filter(Boolean).join(' · '));

    if (!config.badges.length && !note) return html``;

    return html`<div class="trust">
  <div class="wrap">
    ${config.badges.map((badge) => html`<div class="trust-badge">${badge}</div>`)}
    ${note ? html`<div class="trust-note">${note}</div>` : ''}
  </div>
</div>`;
  },
};
