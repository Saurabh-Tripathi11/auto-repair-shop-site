/**
 * Minimal HTML templating. No dependencies, no virtual DOM, no runtime in the
 * browser -- every section renders to a string at build time.
 *
 *   html`<p>${userText}</p>`          -> escaped
 *   html`<div>${html`<b>ok</b>`}</div>` -> nested templates pass through
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>` -> arrays join
 *   raw('<!-- verbatim -->')          -> escape hatch, use deliberately
 */

const RAW = Symbol('raw');

export class Raw {
  constructor(value) {
    this.value = String(value);
    this[RAW] = true;
  }
  toString() {
    return this.value;
  }
}

export const isRaw = (v) => v instanceof Raw || (v && v[RAW] === true);

export const raw = (value) => new Raw(value);

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape a value for use in HTML text or a double-quoted attribute. */
export function esc(value) {
  if (value == null || value === false) return '';
  if (isRaw(value)) return value.toString();
  return String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function flatten(value) {
  if (value == null || value === false || value === true) return '';
  if (isRaw(value)) return value.toString();
  if (Array.isArray(value)) return value.map(flatten).join('');
  return esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += flatten(values[i]) + strings[i + 1];
  return new Raw(out);
}

/** Join an array of templates with a separator, returning Raw. */
export const join = (parts, sep = '') => raw(parts.filter(Boolean).map(flatten).join(sep));

/**
 * Build an attribute string from an object. Skips null/undefined/false, renders
 * `true` as a bare boolean attribute, and escapes everything else.
 *
 *   attrs({ href: '#book', hidden: true, id: null }) -> ` href="#book" hidden`
 */
export function attrs(map) {
  const parts = [];
  for (const [key, value] of Object.entries(map || {})) {
    if (value == null || value === false || value === '') continue;
    if (value === true) parts.push(key);
    else parts.push(`${key}="${esc(value)}"`);
  }
  return raw(parts.length ? ' ' + parts.join(' ') : '');
}

/** Inline style helper: style({ color: 'red', margin: null }) -> `color:red`. */
export function style(map) {
  return Object.entries(map || {})
    .filter(([, v]) => v != null && v !== false && v !== '')
    .map(([k, v]) => `${k}:${v}`)
    .join('; ');
}

/** Encode a value for use inside a URL query string or path segment. */
export const urlParam = (value) => encodeURIComponent(String(value ?? ''));

/** Serialise an object as JSON safe to embed in a <script> block. */
export function jsonScript(value) {
  // U+2028 / U+2029 are valid JSON but terminate a JS string literal.
  const LINE_SEPARATORS = new RegExp('[\\u2028\\u2029]', 'g');
  return raw(
    JSON.stringify(value, null, 2)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(LINE_SEPARATORS, (c) => '\\u' + c.charCodeAt(0).toString(16))
  );
}
