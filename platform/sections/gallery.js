import { html } from '../core/html.js';

/**
 * Section 7 -- photos of the actual shop.
 *
 * Captions state a fact ("Two bays and off-street parking in back"), not a
 * mood. The whole page argues "we are a real place"; stock photography of a
 * different, nicer shop argues the opposite.
 */
export default {
  id: 'gallery',

  css() {
    return `
  .gallery { padding-top: 34px; padding-bottom: 10px; }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
  .gallery figure { margin: 0; }
  .gallery .frame { aspect-ratio: 4/3; border-radius: var(--radius-lg); overflow: hidden; background: var(--line-2); }
  .gallery img { width: 100%; height: 100%; object-fit: cover; }
  .gallery figcaption { font-size: 14px; color: var(--ink-3); margin-top: 7px; }`;
  },

  render({ config }) {
    const photos = config.photos.gallery;
    if (!photos.length) return html``;

    return html`<section class="wrap gallery">
  <div class="gallery-grid">
    ${photos.map((photo) => html`<figure>
      <div class="frame"><img src="${photo.src}" alt="${photo.alt || photo.cap || ''}" loading="lazy"></div>
      ${photo.cap ? html`<figcaption>${photo.cap}</figcaption>` : ''}
    </figure>`)}
  </div>
</section>`;
  },
};
