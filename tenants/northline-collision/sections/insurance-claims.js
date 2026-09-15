import { html } from '../../../platform/core/html.js';

/**
 * Northline only. A collision shop's whole funnel is the claim, so this band
 * sits directly under the trust bar and answers the question the visitor is
 * actually sitting on: "can I even use you, or has my insurer decided?"
 *
 * Content lives under `extra.insurance` in tenant.json. Nothing in the platform
 * knows this section exists -- it is registered because the file is here, and
 * it renders because the id is in this tenant's layout.
 */
export default {
  id: 'insurance-claims',

  css() {
    return `
  .claims { background: var(--dark); color: #fff; padding-top: 38px; padding-bottom: 38px; }
  .claims h2 { margin-bottom: 8px; }
  .claims-lede { color: var(--on-dark); font-size: 16.5px; margin: 0 0 22px; max-width: 62ch; text-wrap: pretty; }
  .claims-carriers { display: flex; flex-wrap: wrap; gap: 8px 10px; margin-bottom: 26px; }
  .claims-carrier {
    border: 1px solid var(--dark-border); border-radius: var(--radius-sm);
    padding: 6px 11px; font-size: 13.5px; font-weight: 600; color: var(--on-dark);
  }
  .claims-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 22px; counter-reset: step; }
  .claims-step { border-top: 2px solid var(--accent); padding-top: 12px; }
  .claims-step-n {
    counter-increment: step; font-size: 12px; font-weight: 800; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--on-dark-faint); margin-bottom: 6px;
  }
  .claims-step-n::before { content: "Step " counter(step); }
  .claims-step-title { font-weight: 700; font-size: 17px; margin-bottom: 5px; line-height: 1.3; }
  .claims-step-body { color: var(--on-dark); font-size: 15.5px; text-wrap: pretty; }
  .claims-note { margin-top: 24px; font-size: 13px; color: var(--on-dark-legal); max-width: 70ch; }`;
  },

  render({ config, warn }) {
    const insurance = config.extra?.insurance;
    if (!insurance) {
      warn('extra.insurance is missing, section skipped');
      return html``;
    }

    return html`<section class="claims">
  <div class="wrap">
    <h2>${insurance.heading}</h2>
    <p class="claims-lede">${insurance.lede}</p>
    <div class="claims-carriers">
      ${(insurance.carriers || []).map((carrier) => html`<div class="claims-carrier">${carrier}</div>`)}
    </div>
    <div class="claims-steps">
      ${(insurance.steps || []).map((step) => html`<div class="claims-step">
        <div class="claims-step-n"></div>
        <div class="claims-step-title">${step.title}</div>
        <div class="claims-step-body">${step.body}</div>
      </div>`)}
    </div>
    ${insurance.note ? html`<div class="claims-note">${insurance.note}</div>` : ''}
  </div>
</section>`;
  },
};
