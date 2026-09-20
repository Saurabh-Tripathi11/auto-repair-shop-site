import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts only. Overrides the stock `booking` id -- an appointment form
 * for a business that takes orders over WhatsApp -- with the one thing it
 * actually asks a visitor to do.
 *
 * Keeps id="book" so anchors already pointing there (the sticky call-bar's
 * second button) still resolve.
 *
 * The number is printed next to the button, not hidden behind it: a buyer
 * saving a supplier's contact wants the digits, and a buyer on desktop can't
 * tap a wa.me link into their phone.
 */
export default {
  id: 'booking',

  css() {
    return `
  .contact-cta {
    background: var(--wash); border-top: 1px solid var(--line);
    padding-top: 56px; padding-bottom: 60px;
  }
  .contact-inner { max-width: 640px; margin: 0 auto; text-align: center; }
  .contact-cta h2 { margin-bottom: 12px; }
  .contact-cta p { color: var(--ink-2); font-size: 16.5px; margin: 0 auto 26px; text-wrap: pretty; }
  .contact-cta .btn-call {
    display: inline-flex; padding: 0 30px; max-width: 100%;
  }
  .contact-number {
    margin-top: 18px; font-size: 15px; color: var(--ink-3);
  }
  .contact-number b { color: var(--ink); font-weight: 700; letter-spacing: 0.01em; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);

    return html`<section id="book" class="contact-cta">
  <div class="wrap contact-inner">
    <h2>${text('contactHeading', 'Get the catalog & pricing')}</h2>
    <p>${text('contactLede', '')}</p>
    <a class="btn btn-call" href="${data.phoneHref}"><span aria-hidden="true" style="font-size:18px">&#128172;</span> ${text('contactCta', 'Chat on WhatsApp')}</a>
    <div class="contact-number">${text('contactNumberLabel', 'WhatsApp')} <b>${data.phone}</b></div>
  </div>
</section>`;
  },
};
