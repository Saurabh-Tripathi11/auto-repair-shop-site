import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 6 -- the owner and the three commitments.
 *
 * Flex rather than grid so the photo column collapses cleanly. The note is
 * written in the owner's voice and should stay specific when a tenant swaps it:
 * a generic owner blurb is worse than no owner blurb.
 */
export default {
  id: 'owner',

  css() {
    return `
  .owner { display: flex; flex-wrap: wrap; gap: 26px 32px; align-items: flex-start; }
  .owner-photo { flex: 0 0 230px; max-width: 100%; }
  .owner-photo .frame { aspect-ratio: 1/1; max-width: 230px; border-radius: var(--radius-lg); overflow: hidden; background: var(--img-bg); margin-bottom: 12px; }
  .owner-photo img { width: 100%; height: 100%; object-fit: cover; }
  .owner-name { font-weight: 700; font-size: 17px; }
  .owner-title { font-size: 14.5px; color: var(--ink-3); }
  .owner-body { flex: 1 1 340px; min-width: 0; }
  .owner-note { font-size: 17.5px; color: var(--ink-strong); margin: 0 0 20px; max-width: 60ch; text-wrap: pretty; }
  .reasons { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; }
  .reason { border-left: 3px solid var(--accent); padding-left: 14px; }
  .reason-title { font-weight: 700; font-size: 17px; margin-bottom: 5px; line-height: 1.3; }
  .reason-body { color: var(--ink-2); font-size: 15.5px; text-wrap: pretty; }`;
  },

  render({ config }) {
    const text = copyFor(config);
    const { owner, reasons } = config;
    if (!owner.name && !owner.note && !reasons.length) return html``;

    return html`<section class="wash sec">
  <div class="wrap owner">
    ${owner.photo || owner.name ? html`<div class="owner-photo">
      ${owner.photo ? html`<div class="frame">
        <img src="${owner.photo}" alt="${owner.photoAlt || owner.name || ''}" loading="lazy">
      </div>` : ''}
      ${owner.name ? html`<div class="owner-name">${owner.name}</div>` : ''}
      ${owner.title ? html`<div class="owner-title">${owner.title}</div>` : ''}
    </div>` : ''}
    <div class="owner-body">
      <h2 style="margin-bottom:14px">${text('ownerHeading', 'How we do things here')}</h2>
      ${owner.note ? html`<p class="owner-note">${owner.note}</p>` : ''}
      ${reasons.length ? html`<div class="reasons">
        ${reasons.map((reason) => html`<div class="reason">
          <div class="reason-title">${reason.title}</div>
          <div class="reason-body">${reason.body}</div>
        </div>`)}
      </div>` : ''}
    </div>
  </div>
</section>`;
  },
};
