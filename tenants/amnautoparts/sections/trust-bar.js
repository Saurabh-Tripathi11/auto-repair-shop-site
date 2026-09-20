import { html } from '../../../platform/core/html.js';

/**
 * amnautoparts only. Overrides the platform trust bar.
 *
 * The stock version renders certification chips (ASE, NAPA) plus a years/
 * warranty line -- credentials a repair shop earns and displays. This company
 * has none of those to claim, and inventing chips to fill the row would be
 * exactly the kind of decoration that makes a page read as fake.
 *
 * What it does have is four verifiable facts about how it operates, so the
 * row becomes a stat strip: figure over label, no borders, no badge styling.
 * Reads from `extra.stats`.
 */
export default {
  id: 'trust-bar',

  css() {
    return `
  .stats { background: var(--wash); border-bottom: 1px solid var(--line); }
  .stats > .wrap {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 22px 30px; padding-top: 26px; padding-bottom: 26px;
  }
  .stat-value {
    font-weight: 800; font-size: 21px; letter-spacing: -0.02em;
    color: var(--ink); line-height: 1.15;
  }
  .stat-label {
    margin-top: 4px; font-size: 13.5px; color: var(--ink-3);
    line-height: 1.4; text-wrap: pretty;
  }`;
  },

  render({ config }) {
    const stats = config.extra?.stats || [];
    if (!stats.length) return html``;

    return html`<div class="stats">
  <div class="wrap">
    ${stats.map((stat) => html`<div class="stat">
      <div class="stat-value">${stat.value}</div>
      <div class="stat-label">${stat.label}</div>
    </div>`)}
  </div>
</div>`;
  },
};
