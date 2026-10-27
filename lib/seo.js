'use strict';

const site = require('./site');
const store = require('./store');

/**
 * Structured data (JSON-LD).
 *
 * Two audiences read this, and they want the same thing for different
 * reasons. Google uses it to decide whether a page earns a rich result —
 * a price, a stock status, an FAQ accordion. Assistants like Claude and
 * Gemini use it because it is the only part of a page that states facts
 * without having to infer them from prose: this is a product, it costs
 * this much, it is sold by this business, which serves these suburbs.
 *
 * Everything here is generated from `lib/site.js` and the live catalogue,
 * so it cannot drift away from what the pages actually say. The street
 * address is deliberately absent — Gizmoz trades online from a residential
 * address, so only the suburb is ever published.
 */

const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;

/** Absolute URL from a site-root path. */
function abs(pathname = '/') {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${site.url}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

/**
 * Suburb-level postal address. Valid structured data without a street line,
 * which is what we want for a business run from home.
 */
function postalAddress() {
  return {
    '@type': 'PostalAddress',
    addressLocality: site.locality,
    addressRegion: site.region,
    postalCode: site.postcode,
    addressCountry: site.country,
  };
}

function openingHours() {
  return site.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }));
}

/**
 * The business itself. Emitted on every page via `@id` references, so the
 * other graphs can point at it instead of repeating it.
 */
function organization() {
  return {
    '@type': ['Organization', 'OnlineStore'],
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: abs('/'),
    logo: {
      '@type': 'ImageObject',
      url: abs('/images/site/logo-full.png'),
      caption: `${site.name} logo`,
    },
    image: abs('/images/site/og-card.png'),
    description:
      `${site.name} is an authorised Lenovo reseller based in ${site.locality}, ${site.regionName}, ` +
      'selling new ThinkPad laptops and accessories, supplying BYOD devices for school students, and ' +
      'installing Wi-Fi and networking for homes and small businesses. Ships Australia-wide.',
    slogan: site.tagline,
    telephone: site.phoneIntl,
    email: site.email,
    address: postalAddress(),
    areaServed: site.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
    identifier: [{ '@type': 'PropertyValue', name: 'ABN', value: site.abn }],
    vatID: site.abn,
    currenciesAccepted: site.currency,
    paymentAccepted: site.paymentAccepted.join(', '),
    openingHoursSpecification: openingHours(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: site.phoneIntl,
        email: site.email,
        areaServed: ['AU', 'NZ'],
        availableLanguage: ['en-AU'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: site.phoneIntl,
        email: site.email,
        areaServed: ['AU', 'NZ'],
        availableLanguage: ['en-AU'],
      },
    ],
    sameAs: [site.social.instagram, site.social.facebook, site.social.ebay],
  };
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: abs('/'),
    name: site.name,
    description: site.tagline,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-AU',
  };
}

/**
 * Breadcrumbs. Assistants lean on these to work out where a page sits and
 * what it is about; Google renders them under the blue link.
 *
 * @param {Array<[string,string]>} trail  [label, path] pairs, Home first.
 */
function breadcrumbs(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, pathname], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(pathname),
    })),
  };
}

/** Availability maps from the stock count the owner maintains. */
function availability(stock) {
  return Number(stock) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

const CONDITIONS = {
  new: 'https://schema.org/NewCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
  used: 'https://schema.org/UsedCondition',
};

/**
 * A single product with its offer.
 *
 * All stock is new through the Lenovo partnership, so `NewCondition` is the
 * default; a product may override it with a `condition` field of
 * "refurbished" or "used" and the markup follows.
 */
function product(p) {
  const url = abs(`/product/${p.slug}`);
  // Go through the store: an uploaded photo may already be an absolute CDN
  // URL, and prefixing the site origin onto one produces a broken link that
  // invalidates the whole Product.
  const images = (p.images || []).map((img) => abs(store.imageUrl(img)));

  const specs = (p.specs || []).filter(([label, value]) => label && value);

  const node = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.name,
    url,
    description: p.tagline || p.description || p.name,
    image: images.length ? images : [abs('/images/site/og-card.png')],
    brand: { '@type': 'Brand', name: (p.brand || 'Lenovo').replace(/^\w/, (c) => c.toUpperCase()) },
    category: p.category === 'accessories' ? 'Computer Accessories' : 'Laptops',
    offers: {
      '@type': 'Offer',
      '@id': `${url}#offer`,
      url,
      price: String(p.price),
      priceCurrency: site.currency,
      availability: availability(p.stock),
      itemCondition: CONDITIONS[p.condition] || CONDITIONS.new,
      seller: { '@id': ORG_ID },
      areaServed: ['AU', 'NZ'],
      priceValidUntil: priceValidUntil(),
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AU',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnLink: abs('/contact#returns'),
        // Faulty goods are returnable under a Lenovo DOA number; change of
        // mind is not. The category above is the closest accurate match.
      },
    },
  };

  if (p.model) node.mpn = p.model;
  if (p.model) node.sku = p.model;
  if (specs.length) {
    node.additionalProperty = specs.map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    }));
  }

  return node;
}

/** Offers expire; a year out is the convention and stops stale-price warnings. */
function priceValidUntil() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/** A shop or category page: the products on it, in order. */
function itemList(products, { name, pathname }) {
  return {
    '@type': 'ItemList',
    name,
    url: abs(pathname),
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/product/${p.slug}`),
      name: p.name,
    })),
  };
}

/**
 * Questions and answers.
 *
 * This is the single highest-leverage block for assistant visibility: an
 * FAQPage is a machine-readable list of exactly the questions people type,
 * answered in full sentences that can be quoted without rewriting.
 *
 * @param {Array<[string,string]>} pairs  [question, answer] — answers may contain simple HTML.
 */
function faq(pairs) {
  return {
    '@type': 'FAQPage',
    mainEntity: pairs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/** A service Gizmoz performs rather than a product it sells. */
function service({ name, description, pathname, serviceType }) {
  return {
    '@type': 'Service',
    name,
    description,
    serviceType: serviceType || name,
    url: abs(pathname),
    provider: { '@id': ORG_ID },
    areaServed: site.areaServed.map((area) => ({ '@type': 'AdministrativeArea', name: area })),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: abs(pathname),
      servicePhone: site.phoneIntl,
    },
  };
}

/** The page itself, tying the graph together. */
function webPage({ pathname, title, description }) {
  return {
    '@type': 'WebPage',
    '@id': `${abs(pathname)}#webpage`,
    url: abs(pathname),
    name: title,
    description,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en-AU',
  };
}

/**
 * Render a set of nodes as one `@graph`. A single graph beats several
 * loose scripts: the nodes can reference each other by `@id`, so the
 * business is described once and pointed at from everywhere else.
 *
 * `<` is escaped so a stray "</script>" in any string cannot close the tag.
 */
function render(nodes) {
  const graph = { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
  const json = JSON.stringify(graph).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

module.exports = {
  abs,
  organization,
  website,
  webPage,
  breadcrumbs,
  product,
  itemList,
  faq,
  service,
  render,
  ORG_ID,
  SITE_ID,
};
