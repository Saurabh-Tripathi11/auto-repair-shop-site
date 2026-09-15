/**
 * Colour maths for the theme system. Used to derive a coherent tint ramp for
 * whatever dark brand colour a tenant picks, and to check contrast at build
 * time so a badly chosen accent fails `check` instead of shipping.
 */

export function parseHex(hex) {
  const m = String(hex).trim().replace(/^#/, '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export const isHex = (value) => {
  try { parseHex(value); return true; } catch { return false; }
};

export const toHex = ([r, g, b]) =>
  '#' + [r, g, b].map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('');

/** Linear mix of two colours. t=0 returns `from`, t=1 returns `to`. */
export function mix(from, to, t) {
  const a = parseHex(from);
  const b = parseHex(to);
  return toHex([0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t));
}

/** Mix a colour toward white. */
export const lighten = (hex, t) => mix(hex, '#ffffff', t);

/** Mix a colour toward black. */
export const darken = (hex, t) => mix(hex, '#000000', t);

/** WCAG relative luminance. */
export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1..21. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const isDark = (hex) => luminance(hex) < 0.18;

/**
 * Pick whichever of `light`/`dark` reads better on `background`. Lets a tenant
 * choose a pale accent without white-on-yellow button text.
 */
export function readableOn(background, light = '#ffffff', dark = '#1c2229') {
  return contrast(background, light) >= contrast(background, dark) ? light : dark;
}
