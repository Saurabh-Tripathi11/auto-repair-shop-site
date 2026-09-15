import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 1 -- sticky header. Identity on the left, navigation and the phone
 * number on the right. The phone block never leaves the screen at any width;
 * the nav does, because below the breakpoint the sticky call bar covers it.
 */
export default {
  id: 'header',

  css({ theme }) {
    return `
  .site-header { border-bottom: 1px solid var(--line); background: var(--surface); position: sticky; top: 0; z-index: 30; }
  .site-header > .wrap {
    padding-top: 11px; padding-bottom: 11px;
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
  }
  .brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
  .brand-mark {
    flex: none; width: 42px; height: 42px; border-radius: var(--radius-sm);
    background: var(--dark); color: #fff; display: flex; align-items: center; justify-content: center;
    font-weight: var(--w-bold); font-size: 17px; letter-spacing: -0.03em; overflow: hidden;
  }
  .brand-mark img { width: 100%; height: 100%; object-fit: contain; }
  .brand-name { font-weight: var(--w-bold); font-size: 17.5px; letter-spacing: -0.015em; line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .brand-sub { font-size: 12.5px; color: var(--ink-3); }
  .header-right { display: flex; align-items: center; gap: 20px; }
  .topnav { display: none; gap: 20px; }
  .navlink { color: var(--ink); text-decoration: none; font-weight: 600; font-size: 15px; }
  .navlink:hover { color: var(--link); }
  .header-phone { flex: none; text-align: right; text-decoration: none; }
  .header-phone .eyebrow { color: var(--ink-3); }
  .header-phone-number { font-weight: var(--w-bold); font-size: 19px; color: var(--accent); letter-spacing: -0.02em; white-space: nowrap; }
  @media (min-width: ${theme.layout.navBreakpoint}) {
    .topnav { display: flex; }
  }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    const { business } = config;
    const logo = options.logo ?? config.photos.logo;
    const subtitle = text(
      'headerSubtitle',
      data.openedYear ? `Serving ${business.city} since ${data.openedYear}` : business.city
    );

    return html`<header class="site-header">
  <div class="wrap">
    <div class="brand">
      <div class="brand-mark">${logo ? html`<img src="${logo}" alt="${business.name}">` : data.initials}</div>
      <div style="min-width:0">
        <div class="brand-name">${business.name}</div>
        <div class="brand-sub">${subtitle}</div>
      </div>
    </div>
    <div class="header-right">
      <nav class="topnav" aria-label="${text('navLabel', 'Sections')}">
        ${data.nav.map((item) => html`<a class="navlink" href="${item.href}">${item.label}</a>`)}
      </nav>
      <a class="header-phone" href="${data.phoneHref}">
        <div class="eyebrow">${text('callEyebrow', 'Call the shop')}</div>
        <div class="header-phone-number">${data.phone}</div>
      </a>
    </div>
  </div>
</header>`;
  },
};
