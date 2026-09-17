'use strict';

/**
 * Brand marks and icons, inlined as SVG so they stay crisp and recolourable.
 *
 * The Gizmoz mark is rebuilt from the vector geometry in the Adobe XD source:
 * a heavy navy ring, a blue dot off its upper right, and a rounded blue
 * parallelogram sitting under it. The parallelogram path below is the
 * `Path 1` outline lifted straight out of the XD document, translated so the
 * ring's bounding box starts at the origin.
 */

const SLASH_PATH =
  'M -9.56 123.68 L 95.25 95.53 C 96.73 95.53 97.92 96.77 97.92 98.29 ' +
  'L 97.92 122.71 C 97.92 124.23 96.73 125.47 95.25 125.47 L -9.56 153.61 ' +
  'C -11.04 153.61 -12.24 152.38 -12.24 150.85 L -12.24 126.44 ' +
  'C -12.24 124.92 -11.04 123.68 -9.56 123.68 Z';

/**
 * The logo mark on its own (nav, footer, favicon).
 * @param {{size?: number, ringColor?: string, accent?: string, title?: string}} opts
 */
function mark(opts = {}) {
  const {
    size = 40,
    ringColor = 'var(--navy)',
    accent = 'var(--blue)',
    title = 'Gizmoz',
  } = opts;
  return `<svg class="mark" width="${size}" height="${size}" viewBox="-16 -25 142 184" role="img" aria-label="${title}">
  <circle cx="42.85" cy="42.85" r="30.4" fill="none" stroke="${ringColor}" stroke-width="24.85"/>
  <circle cx="102.35" cy="-3.55" r="17.9" fill="${accent}"/>
  <path d="${SLASH_PATH}" fill="${accent}"/>
</svg>`;
}

/**
 * The full wordmark: the ring standing in for the "G", then "izmoz".
 * Used large on the home hero and in the footer.
 */
function wordmark(opts = {}) {
  const { height = 92, ringColor = 'var(--navy)', accent = 'var(--blue)' } = opts;
  // `textLength` pins the advance width so the word always ends at x=468,
  // whatever font actually renders. Without it the final letter is clipped by
  // the viewBox as soon as the glyphs are wider than assumed — which is what
  // happens once the Poppins webfont arrives and replaces the fallback.
  return `<svg class="wordmark" height="${height}" viewBox="-16 -25 500 184" role="img" aria-label="Gizmoz">
  <circle cx="42.85" cy="42.85" r="30.4" fill="none" stroke="${ringColor}" stroke-width="24.85"/>
  <circle cx="102.35" cy="-3.55" r="17.9" fill="${accent}"/>
  <path d="${SLASH_PATH}" fill="${accent}"/>
  <text x="96" y="122" textLength="372" lengthAdjust="spacingAndGlyphs"
        font-family="Poppins, Segoe UI, sans-serif" font-size="136" font-weight="700"
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
