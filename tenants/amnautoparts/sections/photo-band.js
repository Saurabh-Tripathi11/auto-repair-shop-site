import { html } from '../../../platform/core/html.js';

/**
 * amnautoparts only. A band of photographs between the argument sections.
 *
 * Deliberately uncaptioned. These are generic stock photographs, not this
 * company's own workshop, and a caption like "our factory floor" under a
 * stock photo is a straightforward lie -- the kind a buyer who reverse-image
 * searches it will catch. Without captions they read as what they are:
 * context imagery. Replace them with real photographs of the actual
 * operation and captions become worth adding.
 *
 * Tiles are CSS `background-image`, so a photo that fails to load leaves a
 * tinted panel rather than a broken-image icon, and the band still reads as
 * an intentional band.
 */
export default {
  id: 'photo-band',

  css() {
    return `
  .photo-band {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 2px; background: var(--line);
  }
  .photo-tile {
    position: relative;
    aspect-ratio: 4 / 3;
    background-color: var(--dark-tint);
    background-size: cover;
    background-position: center;
  }
  @media (min-width: 860px) {
    .photo-tile { aspect-ratio: 3 / 2; }
  }`;
  },

  render({ config }) {
    const photos = config.extra?.photoBand || [];
    if (!photos.length) return html``;

    return html`<div class="photo-band" aria-hidden="true">
  ${photos.map((src) => html`<div class="photo-tile" style="background-image:url('${src}')"></div>`)}
</div>`;
  },
};
