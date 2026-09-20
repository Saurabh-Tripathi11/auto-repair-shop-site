import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts only. Replaces `location` (a directions/hours section that
 * assumes a storefront) and `booking` (an appointment form) with the one
 * conversion this business actually asks for: DM on WhatsApp for the catalog
 * and price.
 *
 * id "book" so it keeps working as the anchor target for anything already
 * pointing at #book -- the sticky call-bar's second button in particular.
 */
export default {
  id: 'booking',

  css() {
    return `
  .contact-cta { background: var(--wash); border-top: 1px solid var(--line); text-align: center; padding: 48px var(--gutter); }
  .contact-cta h2 { margin-bottom: 10px; }
  .contact-cta p { color: var(--ink-2); font-size: 16.5px; max-width: 52ch; margin: 0 auto 22px; }
  .contact-cta .btn-call { display: inline-flex; padding: 0 28px; max-width: 360px; margin: 0 auto; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);

    return html`<section id="book" class="contact-cta">
  <h2>${text('contactHeading', 'Get the catalog & pricing')}</h2>
  <p>${text('contactLede', "Send us the part or category you're after and we'll reply with pricing, MOQs and shipping — same channel, no forms.")}</p>
  <a class="btn btn-call" href="${data.phoneHref}"><span aria-hidden="true" style="font-size:18px">&#128172;</span> ${text('contactCta', 'Chat on WhatsApp')}</a>
</section>`;
  },
};
