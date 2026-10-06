// Tiny, dependency-free templating: `html` escapes interpolations unless they are
// themselves `html`/`raw` results, so views compose safely as strings.

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
export const raw = (s) => new Raw(String(s ?? ''));

function fmt(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(fmt).join('');
  return esc(v);
}

export function html(strings, ...vals) {
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < vals.length) out += fmt(vals[i]);
  }
  return new Raw(out);
}

/** Conditional class names: cx('a', cond && 'b') */
export const cx = (...xs) => xs.filter(Boolean).join(' ');

/** data-* attribute payload helper for actions */
export const data = (obj) => raw(Object.entries(obj).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' '));
