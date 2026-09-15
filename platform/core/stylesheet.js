/**
 * The base stylesheet: everything shared by every section, expressed against
 * the theme tokens. Section-specific rules live with their section.
 */

import { themeCssVars } from './tokens.js';

export function baseStylesheet(theme) {
  return `  :root {
${themeCssVars(theme)}
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--surface); color: var(--ink);
    font-family: var(--font);
    font-size: ${theme.type.base}; line-height: ${theme.type.lineHeight};
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { color: var(--link); }
  a:hover { color: var(--link-hover); }
  h1, h2 { letter-spacing: ${theme.type.tracking}; font-weight: var(--w-bold); margin: 0; }
  h1 { font-size: ${theme.type.h1}; line-height: 1.14; }
  h2 { font-size: ${theme.type.h2}; }
  img { display: block; }
  .wrap { max-width: var(--max); margin: 0 auto; padding-left: var(--gutter); padding-right: var(--gutter); }
  .sec { padding-top: var(--section-pad); padding-bottom: var(--section-pad); }
  .wash { background: var(--wash); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .dark { background: var(--dark); color: #fff; }
  .btn {
    display: flex; align-items: center; justify-content: center; gap: 9px;
    text-decoration: none; border-radius: var(--radius-md); font-weight: var(--w-bold);
  }
  .btn-call { background: var(--accent); color: var(--on-accent); min-height: var(--target-call); font-size: 20px; letter-spacing: -0.01em; }
  .btn-call:hover { filter: brightness(1.08); color: var(--on-accent); }
  .btn-book { background: #fff; color: var(--dark); min-height: var(--target-secondary); font-size: 16.5px; font-weight: 700; flex: 1 1 0; }
  .btn-book:hover { background: var(--book-hover); color: var(--dark); }
  .btn-text { border: 1.5px solid var(--dark-border); color: #fff; min-height: var(--target-secondary); font-size: 16.5px; font-weight: 700; padding: 0 18px; }
  .btn-text:hover { border-color: #fff; color: #fff; }
  .eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .stars { color: var(--star); letter-spacing: 1px; }
  .lede { color: var(--ink-2); font-size: 16.5px; }
  .card { border: 1px solid var(--line); border-radius: var(--radius-lg); padding: 18px; }
  .card h3 { font-weight: 700; font-size: 17px; margin: 0 0 5px; }
  .card p { font-size: 15.5px; color: var(--ink-2); margin: 0; }
  :where(a, button, [tabindex]):focus-visible { outline: 2px solid var(--link); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }`;
}
