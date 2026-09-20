import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts only.
 *
 * A sourcing buyer's first question is never "what do you make" -- it's "what
 * happens after I message you". Three numbered steps, counter-generated so
 * the numbering can't drift out of sync with the content, reading from
 * `extra.orderSteps`.
 *
 * Sits where the repair-shop layout puts its reviews section: this business
 * has no reviews to show, and process is the equivalent reassurance.
 */
export default {
  id: 'how-to-order',

  css() {
    return `
  .order { background: var(--dark); color: #fff; padding-top: 54px; padding-bottom: 58px; }
  .order h2 { margin-bottom: 8px; }
  .order-lede { color: var(--on-dark); font-size: 16.5px; margin: 0; max-width: 56ch; text-wrap: pretty; }
  .order-steps {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 26px; margin-top: 38px; counter-reset: order-step;
  }
  .order-step { counter-increment: order-step; }
  .order-step-n {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; margin-bottom: 14px;
    border: 1.5px solid var(--star-on-dark); border-radius: 50%;
    color: var(--star-on-dark); font-weight: 700; font-size: 15px;
  }
  .order-step-n::before { content: counter(order-step); }
  .order-step-title { font-weight: 700; font-size: 17.5px; margin-bottom: 6px; }
  .order-step-body { color: var(--on-dark); font-size: 15.5px; line-height: 1.55; text-wrap: pretty; }`;
  },

  render({ config }) {
    const text = copyFor(config);
    const steps = config.extra?.orderSteps || [];
    if (!steps.length) return html``;

    return html`<section class="order">
  <div class="wrap">
    <h2>${text('orderHeading', 'How ordering works')}</h2>
    ${text('orderLede', '') ? html`<p class="order-lede">${text('orderLede', '')}</p>` : ''}
    <div class="order-steps">
      ${steps.map((step) => html`<div class="order-step">
        <div class="order-step-n" aria-hidden="true"></div>
        <div class="order-step-title">${step.title}</div>
        <div class="order-step-body">${step.body}</div>
      </div>`)}
    </div>
  </div>
</section>`;
  },
};
