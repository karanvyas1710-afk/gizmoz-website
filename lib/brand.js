'use strict';

/**
 * Brand marks and icons, inlined as SVG so they stay crisp and recolourable.
 *
 * Geometry comes from the Adobe XD source, normalised so the ring's outer
 * radius is 1 unit: the tail below is XD's `Path 1` re-expressed in those
 * units, the ring's counter is 0.379 of its outer radius, and the dot sits at
 * (+1.10, -1.24) radii with a radius of 0.315.
 *
 * The "g" is then sized by two constraints, which is what keeps it in step
 * with the rest of the word rather than towering over it:
 *
 *   - the top of the dot sits on the top of the "i" tittle, which Poppins
 *     Bold puts 0.8015 em above the baseline;
 *   - the bottom of the ring keeps the design's 0.0863 em overshoot below
 *     the baseline, the same way a round letter overshoots a flat one.
 *
 * Solving those together gives a ring radius of 0.3475 em. Everything below
 * is that solution written out at em = 100, baseline = 100.
 */

/** The tail, positioned for the wordmark (ring centre 50, 73.88). */
const TAIL_WORDMARK =
  'M 7.50 139.44 L 92.50 116.61 C 93.70 116.61 94.67 117.62 94.67 118.85 L 94.67 138.65 C 94.67 139.89 93.70 140.89 92.50 140.89 L 7.50 163.72 C 6.30 163.72 5.33 162.71 5.33 161.48 L 5.33 141.67 C 5.33 140.44 6.30 139.44 7.50 139.44 Z';

/** The same tail for the standalone mark (ring centre at the origin, r = 100). */
const TAIL_MARK =
  'M -122.31 188.66 L 122.31 122.97 C 125.76 122.97 128.56 125.86 128.56 129.41 L 128.56 186.40 C 128.56 189.95 125.76 192.84 122.31 192.84 L -122.31 258.53 C -125.76 258.53 -128.56 255.64 -128.56 252.09 L -128.56 195.10 C -128.56 191.55 -125.76 188.66 -122.31 188.66 Z';

/**
 * The logo mark on its own (nav, footer, favicon). Its artwork is taller
 * than it is wide, so width follows from the height rather than being forced
 * square, which would letterbox it.
 */
function mark(opts = {}) {
  const {
    size = 40,
    ringColor = 'var(--navy)',
    accent = 'var(--blue)',
    title = 'Gizmoz',
  } = opts;
  const width = Math.round(size * (278 / 424));
  return `<svg class="mark" width="${width}" height="${size}" viewBox="-133 -160 278 424" role="img" aria-label="${title}">
  <circle cx="0" cy="0" r="68.95" fill="none" stroke="${ringColor}" stroke-width="62.1"/>
  <circle cx="110" cy="-124" r="31.5" fill="${accent}"/>
  <path d="${TAIL_MARK}" fill="${accent}"/>
</svg>`;
}

/**
 * The full wordmark: the ring standing in for the "g", then "izmoz".
 *
 * `textLength` pins the advance width, so the word always ends where the
 * viewBox expects no matter which font actually renders — without it the last
 * letter is clipped the moment the real Poppins replaces the fallback.
 */
function wordmark(opts = {}) {
  const { height = 92, ringColor = 'var(--navy)', accent = 'var(--blue)' } = opts;
  return `<svg class="wordmark" height="${height}" viewBox="0 14 417 156" role="img" aria-label="Gizmoz">
  <circle cx="50" cy="73.88" r="23.96" fill="none" stroke="${ringColor}" stroke-width="21.58"/>
  <circle cx="88.22" cy="30.8" r="10.95" fill="${accent}"/>
  <path d="${TAIL_WORDMARK}" fill="${accent}"/>
  <text x="112.03" y="100" textLength="298.3" lengthAdjust="spacingAndGlyphs"
        font-family="Poppins, Segoe UI, sans-serif" font-size="100" font-weight="700"
        fill="${ringColor}">izmoz</text>
</svg>`;
}

const icons = {
  laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M1.5 19.5h21"/></svg>`,
  keyboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M1.5 2h3l2.6 12.4a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L21 6H5.3"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.5 3 10.5 4.4 10.5 6.9V9H8.5v3h2V21h3.5v-9h2.4l.4-3H14z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 6.5 9.5 7 9.5-7"/></svg>`,
  messenger: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.3 2 2 6.2 2 11.8c0 3 1.3 5.7 3.5 7.5v3.2l3.2-1.8c.9.3 1.9.4 2.9.4 5.7 0 10-4.2 10-9.8S17.7 2 12 2zm1 13.1-2.6-2.8-5 2.8 5.5-5.9 2.7 2.8 4.9-2.8-5.5 5.9z"/></svg>`,
  ebay: `<svg viewBox="0 0 70 24" fill="currentColor" aria-hidden="true"><text x="0" y="18" font-family="Poppins, sans-serif" font-size="17" font-weight="700">ebay</text></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5.2 5.2L20 7"/></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 14 7-7 7 7"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8.8a16 16 0 0 1 20 0M5 12.6a11 11 0 0 1 14 0M8.5 16.3a6 6 0 0 1 7 0"/><circle cx="12" cy="20" r="1.2" fill="currentColor"/></svg>`,
  backpack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M9 4V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M9 13h6"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7M2.5 12.5h19"/></svg>`,
  cap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 1.5 8.2 12 13.5l10.5-5.3z"/><path d="M5.5 10.6v4.6c0 1.6 2.9 3.1 6.5 3.1s6.5-1.5 6.5-3.1v-4.6M22 8.4v6"/></svg>`,
};

module.exports = { mark, wordmark, icons };
