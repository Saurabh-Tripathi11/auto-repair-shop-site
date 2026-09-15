/**
 * Design tokens.
 *
 * Every visual decision in the handoff lives here as a named token with the
 * handoff's exact value as its default, so a tenant that overrides nothing
 * renders the reference design byte-for-byte.
 *
 * The tint ramp that sits on the dark brand surface (hero, footer, utility
 * strip) is *derived* from `color.dark` whenever a tenant changes it and has
 * not spelled the ramp out themselves. That is the difference between a
 * white-label platform and a find-and-replace: a tenant sets one colour and the
 * fourteen shades layered on it follow, still in ratio, still readable.
 */

import { mix, lighten } from './color.js';

export const REFERENCE_DARK = '#0b2136';

/**
 * How far along dark -> white each on-dark shade sits. Measured from the
 * handoff's own values against its navy, so navy reproduces them exactly and
 * any other dark colour gets the same ramp.
 */
export const DARK_RAMP = {
  darkTint: 0.0422,     // hero image backing
  darkRule: 0.1248,     // footer divider
  darkBorder: 0.2618,   // outline button on dark
  onDarkLabel: 0.5414,  // footer column labels
  onDarkLegal: 0.5938,  // footer legal row
  onDarkFaint: 0.6651,  // hero fine print
  onDarkMuted: 0.7651,  // utility strip + footer body
  onDark: 0.8007,       // hero body copy
};

export const DEFAULTS = {
  color: {
    // Brand
    dark: REFERENCE_DARK,
    accent: '#c02a1e',
    onAccent: '#ffffff',
    link: '#0f4c81',
    linkHover: '#0a3457',

    // Light-surface ink
    ink: '#1c2229',
    ink2: '#4b5663',
    ink3: '#5c6874',
    inkQuiet: '#79838f',
    inkStrong: '#2b3948',
    labelInk: '#3a4552',

    // Light-surface structure
    surface: '#ffffff',
    wash: '#f2f5f8',
    line: '#dbe1e8',
    line2: '#e3e8ee',
    imgBg: '#dae1e9',

    // Dark-surface ramp (derived from `dark` unless set explicitly)
    darkTint: '#0f2a44',
    darkRule: '#1d3c5a',
    darkBorder: '#3c5b77',
    onDark: '#c3d2e1',
    onDarkMuted: '#b9cadb',
    onDarkFaint: '#9fb4c8',
    onDarkLabel: '#7e98b2',
    onDarkLegal: '#8ba4bc',

    // Components
    star: '#f1a01a',
    starOnDark: '#ffd25e',
    badgeBorder: '#c9d3de',
    badgeInk: '#2b3948',
    specialBorder: '#c2ccd7',
    specialFill: '#fbfcfd',
    inputBorder: '#bcc6d1',
    inputFocus: '#cfe0ef',
    successBorder: '#bdd8c2',
    successFill: '#f3f9f4',
    barBorder: '#cfd7e0',
    barFill: 'rgba(255,255,255,0.95)',
    bookHover: '#e7eef5',
  },

  font: {
    family: 'Public Sans',
    fallback: 'Helvetica, Arial, sans-serif',
    weights: [400, 500, 600, 700, 800],
    // Set to null to self-host; `head` emits nothing and you supply the @font-face.
    provider: 'google',
  },

  type: {
    base: '17px',
    lineHeight: '1.55',
    h1: 'clamp(29px, 6.4vw, 40px)',
    h2: 'clamp(24px, 5.2vw, 31px)',
    tracking: '-0.025em',
    // The heaviest weight the page uses. Drop it to 700 for a family that has
    // no 800 -- otherwise the browser synthesises one and the headings smear.
    boldWeight: 800,
  },

  radius: { sm: '4px', md: '5px', lg: '6px' },

  layout: {
    maxWidth: '1140px',
    gutter: '18px',
    sectionPad: '44px',
    navBreakpoint: '860px',
  },

  target: {
    call: '60px',
    secondary: '52px',
    bar: '54px',
    input: '50px',
    submit: '56px',
  },
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function deepMerge(base, patch) {
  if (!isPlainObject(patch)) return patch === undefined ? base : patch;
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isPlainObject(value) && isPlainObject(base?.[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

/**
 * Merge a tenant's theme over the defaults and fill in any dark-ramp shade the
 * tenant did not set, derived from their `color.dark`.
 */
export function resolveTheme(themeInput = {}) {
  const theme = deepMerge(DEFAULTS, themeInput);
  const given = themeInput.color || {};
  const dark = theme.color.dark;

  if (dark !== REFERENCE_DARK) {
    for (const [token, ratio] of Object.entries(DARK_RAMP)) {
      if (given[token] === undefined) theme.color[token] = lighten(dark, ratio);
    }
    if (given.starOnDark === undefined) theme.color.starOnDark = mix(theme.color.star, '#ffffff', 0.42);
  }

  theme.font.stack = `'${theme.font.family}', ${theme.font.fallback}`;
  return theme;
}

// ink2 -> --ink-2, onDarkLabel -> --on-dark-label
const CSS_VAR = (key) =>
  '--' + key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()).replace(/([a-z])(\d)/g, '$1-$2');

/** Flatten the resolved theme into the `:root` custom properties sections use. */
export function themeCssVars(theme) {
  const lines = [];
  for (const [key, value] of Object.entries(theme.color)) lines.push(`${CSS_VAR(key)}: ${value};`);
  for (const [key, value] of Object.entries(theme.radius)) lines.push(`--radius-${key}: ${value};`);
  lines.push(`--max: ${theme.layout.maxWidth};`);
  lines.push(`--gutter: ${theme.layout.gutter};`);
  lines.push(`--section-pad: ${theme.layout.sectionPad};`);
  lines.push(`--font: ${theme.font.stack};`);
  lines.push(`--w-bold: ${theme.type.boldWeight};`);
  for (const [key, value] of Object.entries(theme.target)) lines.push(`--target-${key}: ${value};`);
  return lines.map((l) => '    ' + l).join('\n');
}

/** The webfont <link> tags, or nothing when the tenant self-hosts. */
export function fontLinks(theme) {
  if (theme.font.provider !== 'google') return '';
  const family = theme.font.family.replace(/ /g, '+');
  const weights = [...new Set(theme.font.weights)].sort((a, b) => a - b).join(';');
  return [
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link href="https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap" rel="stylesheet">`,
  ].join('\n');
}
