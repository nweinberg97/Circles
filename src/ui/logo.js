// The Circles mark: four open "C" rings orbiting a shared centre,
// redrawn as geometry from the original title-slide logo so it stays crisp at any size.

const TAU = Math.PI * 2;
const rad = (deg) => (deg * Math.PI) / 180;
const f = (n) => Math.round(n * 100) / 100;

function ring(cx, cy, R, r, gapDeg, halfWidth) {
  const t = rad(gapDeg);
  const go = Math.asin(halfWidth / R);
  const gi = Math.asin(halfWidth / r);
  const p = (a, rr) => `${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  return [
    `M${p(t + go, R)}`,
    `A${R} ${R} 0 1 1 ${p(t - go + TAU, R)}`,
    `L${p(t - gi, r)}`,
    `A${r} ${r} 0 1 0 ${p(t + gi, r)}`,
    'Z',
  ].join('');
}

/** Path data for the mark inside a 100×100 box. */
export function markPath({ rotation = 12, d = 21, R = 15.5, r = 8.6, gapTilt = 8, gapHalf = 4 } = {}) {
  const parts = [];
  for (let k = 0; k < 4; k++) {
    const a = -90 + rotation + 90 * k;
    const cx = 50 + d * Math.cos(rad(a));
    const cy = 50 + d * Math.sin(rad(a));
    parts.push(ring(cx, cy, R, r, a + gapTilt, gapHalf));
  }
  return parts.join('');
}

const HUB_R = 12;

/** Inline SVG for the mark. `fill` defaults to currentColor. */
export function markSVG({ size = 28, fill = 'currentColor', title = 'Circles', className = '' } = {}) {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="12 12 76 76" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg"><g fill="${fill}"><circle cx="50" cy="50" r="${HUB_R}"/><path d="${markPath()}"/></g></svg>`;
}

/** Standalone favicon SVG: teal mark on a navy rounded tile. */
export function faviconSVG({ bg = '#06335A', fg = '#6AD3CB', radius = 22 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="${radius}" fill="${bg}"/><g transform="translate(50 50) scale(1.07) translate(-50 -50)" fill="${fg}"><circle cx="50" cy="50" r="${HUB_R}"/><path d="${markPath()}"/></g></svg>`;
}
