import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 12 -- the fixed bottom call bar.
 *
 * It reserves its own space (`body { padding-bottom }`) and both the bar and
 * the padding are removed above the breakpoint, so desktop gets no phantom gap.
 * `options.mode` is "mobile" (default), "always", or "off".
 */
export default {
  id: 'call-bar',

  css({ theme, options }) {
    const mode = options.mode || 'mobile';
    const base = `
  .callbar {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
    display: flex; gap: 9px; padding: 9px;
    padding-bottom: calc(9px + env(safe-area-inset-bottom, 0px));
    background: var(--bar-fill); border-top: 1px solid var(--bar-border); backdrop-filter: blur(8px);
  }
  .callbar a { text-decoration: none; min-height: var(--target-bar); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 8px; }
  .callbar-call { flex: 2 1 0; background: var(--accent); color: var(--on-accent); font-weight: var(--w-bold); font-size: 17.5px; }
  .callbar-book { flex: 1 1 0; background: var(--surface); border: 1.5px solid var(--dark); color: var(--dark); font-weight: 700; font-size: 16.5px; }
  body { padding-bottom: 74px; }`;

    if (mode === 'always') return base;
    if (mode === 'off') return '';
    return `${base}
  @media (min-width: ${theme.layout.navBreakpoint}) {
    .callbar { display: none; }
    body { padding-bottom: 0; }
  }`;
  },

  render({ config, data, options }) {
    const text = copyFor(config);
    if ((options.mode || 'mobile') === 'off') return html``;

    return html`<div class="callbar">
  <a class="callbar-call" href="${data.phoneHref}"><span aria-hidden="true" style="font-size:16px">&#9742;</span> ${text('barCall', 'Call')} ${data.phone}</a>
  <a class="callbar-book" href="#book">${text('barBook', 'Book')}</a>
</div>`;
  },
};
