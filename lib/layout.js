'use strict';

const { sizeAttrs } = require('./imagesize');

const site = require('./site');
const seo = require('./seo');
const { mark, wordmark, icons } = require('./brand');

/** Escape text destined for HTML body or attribute context. */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render a multi-paragraph string (blank-line separated) as <p> elements. */
function paragraphs(text, className = '') {
  const cls = className ? ` class="${className}"` : '';
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${cls}>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

function money(cents) {
  return '$' + Number(cents).toLocaleString('en-AU');
}

function navLink(item, current) {
  const active = current === item.href || (item.href !== '/' && current.startsWith(item.href));
  const cls = `nav-link${active ? ' is-active' : ''}`;
  if (!item.children) {
    return `<li><a class="${cls}" href="${item.href}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`;
  }
  const sub = item.children
    .map((c) => `<li><a href="${c.href}">${esc(c.label)}</a></li>`)
    .join('');
  return `<li class="has-sub">
    <a class="${cls}" href="${item.href}"${active ? ' aria-current="page"' : ''}>${esc(item.label)} <span class="chev">${icons.chevron}</span></a>
    <ul class="subnav">${sub}</ul>
  </li>`;
}

function header(current) {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="Gizmoz home">${mark({ size: 38 })}</a>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
      <span class="bars" aria-hidden="true"></span>
      <span class="sr-only">Menu</span>
    </button>

    <nav class="primary-nav" id="primary-nav" aria-label="Primary">
      <ul>${site.nav.map((i) => navLink(i, current)).join('')}</ul>
    </nav>

    <a class="cart-link" href="/cart" aria-label="Basket">
      ${icons.cart}
      <span class="cart-count" data-cart-count hidden>0</span>
    </a>
  </div>
</header>`;
}

/** The blue category strip that sits directly under the header in the design. */
function categoryStrip() {
  return `<div class="cat-strip">
  <div class="wrap cat-strip-inner">
    <a href="/shop/laptops">${icons.laptop}<span>Laptops</span></a>
    <a href="/shop/accessories">${icons.keyboard}<span>Accessories</span></a>
  </div>
</div>`;
}

function footer() {
  return `<a class="to-top" href="#top">
  <span>GO TO TOP</span>
  ${icons.arrowUp}
</a>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-col footer-about">
      <div class="footer-social">
        <a href="${site.social.instagram}" aria-label="Instagram" rel="noopener" target="_blank">${icons.instagram}</a>
        <a href="${site.social.facebook}" aria-label="Facebook" rel="noopener" target="_blank">${icons.facebook}</a>
        <a href="${site.social.ebay}" aria-label="eBay store" rel="noopener" target="_blank">${icons.ebay}</a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Gizmoz. All rights reserved.</p>
      <p class="abn">Gizmoz ABN: <em>${site.abn}</em></p>
    </div>

    <div class="footer-col footer-logo">
      <div class="footer-mark">${mark({ size: 74 })}</div>
    </div>

    <div class="footer-col footer-links">
      <h2>Overview</h2>
      <ul>
        <li><a href="/shop">Shop</a></li>
        <li><a href="/personal-solutions">Personal Solutions</a></li>
        <li><a href="/our-story">Our Story</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

/**
 * Wrap a page body in the full document shell.
 *
 * @param {object} opts
 * @param {string} opts.title       Document title (site name is appended).
 * @param {string} opts.description Meta description.
 * @param {string} opts.body        Page HTML.
 * @param {string} opts.current     Current path, for nav highlighting.
 * @param {boolean} [opts.strip]    Show the blue category strip.
 * @param {string} [opts.path]      Canonical path, when it differs from `current`.
 * @param {Array}  [opts.jsonld]    Extra structured-data nodes for this page.
 * @param {string} [opts.image]     Social preview image path.
 * @param {boolean} [opts.noindex]  Keep this page out of search results.
 */
function page({
  title,
  description,
  body,
  current = '/',
  strip = true,
  path: canonicalPath,
  jsonld = [],
  image,
  noindex = false,
}) {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} — ${site.tagline}`;
  const pathname = canonicalPath || current;
  const canonical = seo.abs(pathname);
  const ogImage = seo.abs(image || '/images/site/og-card.png');

  // One graph per page: the business and the site, described once, plus
  // whatever this particular page adds (a product, a list, an FAQ).
  const structured = seo.render([
    seo.organization(),
    seo.website(),
    seo.webPage({ pathname, title: fullTitle, description: description || site.tagline }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || '')}">
<link rel="canonical" href="${esc(canonical)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}

<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || '')}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:locale" content="en_AU">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.tagline)}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(fullTitle)}">
<meta name="twitter:description" content="${esc(description || '')}">
<meta name="twitter:image" content="${esc(ogImage)}">

<meta name="geo.region" content="AU-NSW">
<meta name="geo.placename" content="${esc(site.locality)}">
<meta name="theme-color" content="#1363df">
${structured}
<link rel="icon" href="/favicon.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
</head>
<body id="top">
${header(current)}
${strip ? categoryStrip() : ''}
<main id="main">
${body}
</main>
${footer()}
<script src="/js/site.js" defer></script>
</body>
</html>`;
}

/**
 * The gradient page banner used on every inner page in the design, complete
 * with its scattered translucent triangles.
 */
function banner({ eyebrow, title, lead, extra = '' }) {
  return `<section class="page-banner">
  <div class="banner-shapes" aria-hidden="true">
    <span class="tri t1"></span><span class="tri t2"></span>
    <span class="tri t3"></span><span class="tri t4"></span>
    <span class="blob b1"></span><span class="blob b2"></span>
  </div>
  <div class="wrap banner-inner">
    ${eyebrow ? `<p class="banner-eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="banner-lead">${esc(lead)}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

/** The green "Lenovo Authorized PC Partner" badge from the design. */
function partnerBadge() {
  return `<div class="partner-badge">
  <img src="/images/site/lenovo-pc-partner.png" alt="Lenovo Authorized PC Partner"${sizeAttrs('site/lenovo-pc-partner.png')} loading="lazy">
</div>`;
}

module.exports = { page, header, footer, banner, partnerBadge, esc, paragraphs, money, icons, mark, wordmark };
