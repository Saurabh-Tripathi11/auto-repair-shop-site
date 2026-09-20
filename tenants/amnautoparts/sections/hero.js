import { html } from '../../../platform/core/html.js';
import { copyFor } from '../../../platform/core/copy.js';

/**
 * amnautoparts' hero, replacing the platform's.
 *
 * Full-bleed photograph behind a dark scrim rather than the platform's
 * side-by-side text/image grid -- a supplier's hero is a single statement,
 * not a split. The photo is a CSS `background-image`, not an `<img>`:
 * a background that fails to load leaves the dark panel underneath it
 * looking deliberate, where a broken `<img>` leaves a broken-image icon in
 * the middle of the page.
 *
 * Everything sits on `--dark` regardless, so the type contrast is the same
 * whether or not the photograph arrives.
 */
export default {
  id: 'hero',

  css({ config }) {
    const photo = config.photos.hero;
    return `
  .hero {
    position: relative;
    background: var(--dark);
    color: #fff;
    overflow: hidden;
  }
  ${photo ? `.hero::before {
    content: "";
    position: absolute; inset: 0;
    background-image: url("${photo}");
    background-size: cover;
    background-position: center;
    opacity: 0.5;
  }
  /* Opaque behind the column the type sits in, clearing toward the right so
     the photograph is actually visible rather than a texture under a wash. */
  .hero::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(100deg,
      var(--dark) 0%,
      rgba(28,28,28,0.92) 34%,
      rgba(28,28,28,0.55) 66%,
      rgba(28,28,28,0.22) 100%);
  }` : ''}
  .hero > .wrap { position: relative; z-index: 1; padding-top: 68px; padding-bottom: 72px; }
  .hero-eyebrow {
    font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--star-on-dark); margin-bottom: 18px;
  }
  .hero h1 { max-width: 17ch; font-size: clamp(34px, 5.6vw, 52px); line-height: 1.06; }
  .hero-lede {
    font-size: 18px; line-height: 1.55; color: var(--on-dark);
    margin: 18px 0 0; max-width: 52ch; text-wrap: pretty;
  }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
  .hero-actions .btn { flex: 0 1 auto; padding: 0 26px; }
  .hero-actions .btn-book {
    background: transparent; border: 1.5px solid var(--dark-border); color: #fff;
  }
  .hero-actions .btn-book:hover { background: rgba(255,255,255,0.08); border-color: #fff; color: #fff; }
  .hero-proof {
    display: flex; flex-wrap: wrap; gap: 8px 26px; align-items: center;
    margin-top: 34px; padding-top: 22px; border-top: 1px solid var(--dark-rule);
    font-size: 14.5px; color: var(--on-dark-muted);
  }
  .hero-proof b { color: #fff; font-weight: 700; }
  @media (min-width: 860px) {
    .hero > .wrap { padding-top: 92px; padding-bottom: 96px; }
  }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const proof = config.extra?.heroProof || [];

    return html`<section class="hero">
  <div class="wrap">
    ${text('heroEyebrow', '') ? html`<div class="hero-eyebrow">${text('heroEyebrow', '')}</div>` : ''}
    <h1>${text('headline', '')}</h1>
    <p class="hero-lede">${text('tagline', '')}</p>
    <div class="hero-actions">
      <a class="btn btn-call" href="${data.phoneHref}" data-place="hero"><span aria-hidden="true" style="font-size:18px">&#128172;</span> ${text('callNow', 'Chat on WhatsApp')}</a>
      <a class="btn btn-book" href="#catalog">${text('bookCta', 'View Products')}</a>
    </div>
    ${proof.length ? html`<div class="hero-proof">
      ${proof.map((item) => html`<span><b>${item.value}</b> ${item.label}</span>`)}
    </div>` : ''}
  </div>
</section>`;
  },
};
