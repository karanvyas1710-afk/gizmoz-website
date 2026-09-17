'use strict';

const { sizeAttrs } = require('./imagesize');

/**
 * Brand marks and icons.
 *
 * The two logo lockups are the supplied brand artwork, served as transparent
 * PNGs trimmed to their ink so nothing carries invisible padding into the
 * layout. Everything else here is inline SVG so it inherits `currentColor`.
 *
 *   logo-full.png  the wordmark with the tagline beneath it   (1151 x 412)
 *   logo-mark.png  the "g" on its own, for the nav and footer  (270 x 412)
 */

const LOGO_FULL = 'site/logo-full.png';
const LOGO_MARK = 'site/logo-mark.png';

const MARK_ASPECT = 270 / 412;   // width / height of the trimmed artwork

/**
 * The logo mark on its own (nav, footer).
 *
 * The artwork is taller than it is wide, so width is derived from the height
 * asked for. `alt` is empty by default because both callers sit inside an
 * element that already carries the accessible name.
 */
function mark(opts = {}) {
  const { size = 40, alt = '' } = opts;
  const width = Math.round(size * MARK_ASPECT);
  return `<img class="mark" src="/images/${LOGO_MARK}" alt="${alt}" width="${width}" height="${size}" decoding="async">`;
}

/**
 * The full logo lockup: the "g", the word, and the tagline beneath it.
 * Sized by CSS; the intrinsic dimensions are emitted so the browser can
 * reserve the right box before the file arrives.
 */
function wordmark(opts = {}) {
  const { alt = 'Gizmoz — Your Technology Solutions Partner', eager = false } = opts;
  return `<img class="wordmark" src="/images/${LOGO_FULL}" alt="${alt}"${sizeAttrs(LOGO_FULL)}${
    eager ? ' fetchpriority="high"' : ' decoding="async"'
  }>`;
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
