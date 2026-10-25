'use strict';

const { sizeAttrs } = require('../lib/imagesize');

const { page, banner, esc } = require('../lib/layout');
const { productGrid } = require('../lib/components');
const seo = require('../lib/seo');

const BRAND_COPY = {
  lenovo: {
    title: 'Lenovo Laptops and Accessories',
    seo:
      'New Lenovo ThinkPad laptops and accessories from Gizmoz, a verified Lenovo PC Partner in Sydney. ' +
      'Genuine warranty, shipped Australia-wide.',
    lead:
      'We are a verified Lenovo PC Partner, so every Lenovo machine we sell is new stock carrying genuine ' +
      'Lenovo warranty — sourced from distributors rather than the retail shelf.',
  },
  hp: {
    title: 'HP Laptops and Desktops',
    seo:
      'HP laptops and desktops sourced to order by Gizmoz in Sydney. Tell us the specification you need ' +
      'and we will quote it. Shipped Australia-wide.',
    lead:
      'We source HP laptops and desktops to order through our distributors. Tell us the specification you are ' +
      'after and we will quote it.',
  },
  dell: {
    title: 'Dell Laptops and Desktops',
    seo:
      'Dell laptops and desktops sourced to order by Gizmoz in Sydney. Tell us the specification you need ' +
      'and we will quote it. Shipped Australia-wide.',
    lead:
      'We source Dell laptops and desktops to order through our distributors. Tell us the specification you are ' +
      'after and we will quote it.',
  },
};

const CATEGORY_COPY = {
  laptops: {
    title: 'Laptops and ThinkPads',
    seo:
      'Buy new Lenovo ThinkPad laptops from Gizmoz, an authorised Lenovo reseller in Sydney. ' +
      'Genuine manufacturer warranty, BYOD school devices, shipped Australia-wide.',
    lead: 'Every laptop currently on the shelf at Gizmoz.',
  },
  accessories: {
    title: 'Laptop Accessories',
    seo:
      'ThinkPad docks, wireless mice and desk accessories from Gizmoz, an authorised Lenovo reseller ' +
      'in Sydney. Shipped Australia-wide.',
    lead: 'Docks, mice and the bits that make a desk work properly.',
  },
};

const SHOP_LEAD =
  'Support authentic Aussie small business and shop Gizmoz’s range of laptops and devices with ease. ' +
  'As a verified Lenovo PC Partner, we will always make sure that you get your money’s worth. ' +
  'Keep posted on our social media and website for more!';

/** Shorter than SHOP_LEAD, because Google truncates a description past ~160 characters. */
const SHOP_SEO =
  'Shop new Lenovo ThinkPad laptops and accessories at Gizmoz, a verified Lenovo PC Partner in ' +
  'Sydney. Genuine warranty, free local pickup, shipped Australia-wide.';

/** Filter chips across the top of the grid. */
function filterBar(current) {
  const links = [
    { href: '/shop', label: 'All' },
    { href: '/shop/laptops', label: 'Laptops' },
    { href: '/shop/accessories', label: 'Accessories' },
    { href: '/shop/lenovo', label: 'Lenovo' },
    { href: '/shop/hp', label: 'HP' },
    { href: '/shop/dell', label: 'Dell' },
  ];
  return `<nav class="filter-bar" aria-label="Shop filters">
    ${links
      .map(
        (l) =>
          `<a class="chip${l.href === current ? ' is-active' : ''}" href="${l.href}"${
            l.href === current ? ' aria-current="page"' : ''
          }>${esc(l.label)}</a>`
      )
      .join('')}
  </nav>`;
}

/** The "can't find it?" panel that closes every shop view. */
function helpPanel(brandTitle) {
  const what = brandTitle ? `a ${brandTitle} device` : 'what you’re looking for';
  return `<section class="help-panel">
  <div class="wrap help-panel-inner">
    <div>
      <h2>Can’t find ${esc(what)}?</h2>
      <p>What you see here is the stock we hold right now. We order from several wholesale distributors, so if you
      tell us the specification you need, we will find it and quote it — usually the same day.</p>
    </div>
    <div class="help-panel-actions">
      <a class="btn" href="/find-your-ideal-device">Find your ideal device</a>
      <a class="btn btn-ghost" href="/contact">Ask us directly</a>
    </div>
  </div>
</section>`;
}

/**
 * One renderer serves the whole shop: the full store, a category view and a
 * brand view differ only in which products survive the filter and what the
 * banner says.
 */
module.exports = function shop(products, { brand, category } = {}) {
  let list = products;
  let copy = { title: 'Laptops and Accessories', lead: SHOP_LEAD, seo: SHOP_SEO };
  let current = '/shop';
  let brandTitle = null;

  if (brand) {
    list = products.filter((p) => p.brand === brand);
    copy = BRAND_COPY[brand];
    current = `/shop/${brand}`;
    brandTitle = copy.title;
  } else if (category) {
    list = products.filter((p) => p.category === category);
    copy = CATEGORY_COPY[category];
    current = `/shop/${category}`;
  }

  const count = list.length;
  const body = `
${banner({
  eyebrow: 'Shop Gizmoz’s stock',
  title: copy.title,
  lead: copy.lead,
  extra: `<div class="banner-badge"><img src="/images/site/lenovo-pc-partner.png" alt="Lenovo Authorized PC Partner"${sizeAttrs('site/lenovo-pc-partner.png')}></div>`,
})}

<section class="shop-body">
  <div class="wrap">
    ${filterBar(current)}
    <p class="result-count">Showing ${count} of ${count} item${count === 1 ? '' : 's'}</p>
    ${productGrid(list)}
  </div>
</section>

${helpPanel(brandTitle)}
`;

  const trail = [['Home', '/'], ['Shop', '/shop']];
  if (current !== '/shop') trail.push([copy.title, current]);

  return page({
    title: copy.title,
    description: copy.seo || copy.lead,
    body,
    current,
    // A brand filter with nothing behind it is a thin page. Keep it usable
    // for a visitor who clicks the chip, but out of the index until it has
    // stock to show.
    noindex: list.length === 0,
    jsonld: [
      seo.breadcrumbs(trail),
      seo.itemList(list, { name: copy.title, pathname: current }),
      {
        '@type': 'CollectionPage',
        name: copy.title,
        description: copy.lead,
      },
    ],
  });
};
