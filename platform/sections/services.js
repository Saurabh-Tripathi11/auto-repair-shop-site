import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 4 -- the service list with real starting prices.
 *
 * A lead with no price expectation calls three shops. `from $189` and `quoted`
 * are both honest; a blank is not. Splits into `options.columns` even columns
 * (default 2), so a tenant with nine services still gets a balanced list.
 */
export default {
  id: 'services',

  css() {
    return `
  .services { padding-top: var(--section-pad); }
  .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; align-items: start; }
  .services-col { border-top: 2px solid var(--ink); }
  .svc { border-bottom: 1px solid var(--line-2); padding: 15px 0; }
  .svc-head { display: flex; justify-content: space-between; gap: 14px; align-items: baseline; }
  .svc-name { font-weight: 700; font-size: 18px; }
  .svc-price { font-weight: 700; font-size: 15px; color: var(--accent); white-space: nowrap; }
  .svc-line { color: var(--ink-2); font-size: 16px; margin-top: 3px; text-wrap: pretty; }`;
  },

  render({ config, options }) {
    const text = copyFor(config);
    if (!config.services.length) return html``;

    const columns = Math.max(1, options.columns ?? 2);
    const perColumn = Math.ceil(config.services.length / columns);
    const groups = Array.from({ length: columns }, (_, i) =>
      config.services.slice(i * perColumn, (i + 1) * perColumn)
    ).filter((group) => group.length);

    return html`<section id="services" class="wrap services">
  <h2 style="margin-bottom:6px">${text('servicesHeading', 'What we work on')}</h2>
  ${text('servicesLede', '') ? html`<p class="lede" style="margin:0 0 18px; max-width:62ch">${text('servicesLede', '')}</p>` : ''}
  <div class="services-grid">
    ${groups.map((group) => html`<div class="services-col">
      ${group.map((service) => html`<div class="svc">
        <div class="svc-head">
          <div class="svc-name">${service.name}</div>
          <div class="svc-price">${service.price}</div>
        </div>
        ${service.line ? html`<div class="svc-line">${service.line}</div>` : ''}
      </div>`)}
    </div>`)}
  </div>
</section>`;
  },
};
