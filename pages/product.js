'use strict';

const site = require('../lib/site');
const { page, esc, paragraphs, money, icons } = require('../lib/layout');
const { productGrid, stockLabel } = require('../lib/components');
const { sizeAttrs } = require('../lib/imagesize');
const { imageUrl } = require('../lib/store');

const SHIPPING = 'Shipping only to Australia and New Zealand.';

const RETURNS = [
  'Returns are only accepted if the product is faulty and has a valid DOA number obtained from Lenovo by calling ' +
    'them on 13 53 66 86 or via support.lenovo.com. Once the DOA number is approved, please send the package back to ' +
    'our office and we will process the credit within 30 days.',
  'Note that returns are not accepted if you change your mind. On a case-to-case basis, we can review the return if ' +
    'the product is in the original packaging with the seal intact.',
  'Gizmoz is an Authorised Lenovo Reseller. We are a start-up company with years of experience in offering the best ' +
    'computing solutions. Our Lenovo devices come with genuine Lenovo warranty. Message us if you have any questions.',
];

function gallery(p) {
  const thumbs = p.images
    .map(
      (img, i) =>
        `<button class="thumb${i === 0 ? ' is-active' : ''}" type="button" data-full="${esc(imageUrl(img))}" aria-label="View image ${i + 1}">
          <img src="${esc(imageUrl(img))}" alt=""${sizeAttrs(img)} loading="lazy">
        </button>`
    )
    .join('');
  return `<div class="gallery">
  <div class="gallery-main">
    <img id="gallery-main-img" src="${esc(imageUrl(p.images[0]))}" alt="${esc(p.name)}"${sizeAttrs(p.images[0])}>
  </div>
  ${p.images.length > 1 ? `<div class="gallery-thumbs">${thumbs}</div>` : ''}
</div>`;
}

function specTable(p) {
  return `<table class="spec-table">
  <caption class="sr-only">Specifications for ${esc(p.name)}</caption>
  <tbody>
  ${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}
  </tbody>
</table>`;
}

module.exports = function product(p, allProducts) {
  const related = allProducts.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const outOfStock = p.stock <= 0;
  const saving = p.wasPrice ? p.wasPrice - p.price : 0;

  const buy = outOfStock
    ? `<button class="btn btn-lg" type="button" disabled>Out of stock</button>
       <a class="btn btn-ghost btn-lg" href="/contact?subject=${encodeURIComponent('Order status')}&amp;about=${encodeURIComponent(p.name)}">Ask when it's back</a>`
    : `<button class="btn btn-lg" type="button" data-add-to-cart
         data-slug="${esc(p.slug)}" data-name="${esc(p.shortName)}" data-price="${p.price}"
         data-image="${esc(imageUrl(p.images[0]))}">Buy now</button>
       <a class="btn btn-ghost btn-lg" href="${site.social.ebay}" target="_blank" rel="noopener">Buy on eBay</a>`;

  const body = `
<nav class="crumbs" aria-label="Breadcrumb">
  <div class="wrap">
    <a href="/shop">&larr; Back to store</a>
  </div>
</nav>

<article class="product">
  <div class="wrap product-top">
    ${gallery(p)}
    <div class="product-buy">
      <h1>${esc(p.name)}</h1>
      <p class="product-tagline">${esc(p.tagline)}</p>
      <p class="product-price">
        ${p.wasPrice ? `<s>${money(p.wasPrice)}</s>` : ''}
        <strong>${money(p.price)}</strong>
        ${saving ? `<span class="save">Save ${money(saving)}</span>` : ''}
      </p>
      ${paragraphs(p.description, 'product-desc')}
      <div class="product-actions">${buy}</div>
      <p class="product-stock">${stockLabel(p.stock)}</p>
      <ul class="product-assurances">
        <li>${icons.check} Genuine Lenovo warranty</li>
        <li>${icons.check} Local pickup available in ${esc(site.addressShort)}</li>
        <li>${icons.check} Questions? Call ${esc(site.phone)}</li>
      </ul>
    </div>
  </div>

  <div class="wrap product-detail">
    <section class="detail-block">
      <h2>Specifications</h2>
      ${specTable(p)}
    </section>

    <section class="detail-block">
      <h2>Shipping</h2>
      <p>${esc(SHIPPING)}</p>
    </section>

    <section class="detail-block">
      <h2>Return policy</h2>
      ${RETURNS.map((r) => `<p>${esc(r)}</p>`).join('')}
    </section>
  </div>
</article>

${
  related.length
    ? `<section class="related">
  <div class="wrap">
    <h2>You might also need</h2>
    ${productGrid(related)}
  </div>
</section>`
    : ''
}
`;

  return page({
    title: p.name,
    description: `${p.name} — ${money(p.price)}. ${p.tagline} Available from Gizmoz, an authorised Lenovo reseller in Sydney.`,
    body,
    current: '/shop',
  });
};
