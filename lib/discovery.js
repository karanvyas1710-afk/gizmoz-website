'use strict';

const site = require('./site');
const store = require('./store');
const seo = require('./seo');

/**
 * The three files crawlers fetch before they read anything else.
 *
 *   robots.txt   who may crawl, and where the sitemap is
 *   sitemap.xml  every page worth indexing, with a last-modified date
 *   llms.txt     a plain-language brief for assistants (see llmstxt.org)
 *
 * All three are generated from the live catalogue rather than written by
 * hand, so adding a product in the stock manager puts it in the sitemap
 * and the AI brief without anyone remembering to.
 */

/** Static pages worth indexing, with a crawl priority and change rate. */
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/shop/laptops', priority: '0.9', changefreq: 'daily' },
  { path: '/shop/accessories', priority: '0.7', changefreq: 'weekly' },
  { path: '/shop/lenovo', priority: '0.8', changefreq: 'weekly' },
  { path: '/byod', priority: '0.9', changefreq: 'monthly' },
  { path: '/wifi-solutions', priority: '0.8', changefreq: 'monthly' },
  { path: '/personal-solutions', priority: '0.7', changefreq: 'monthly' },
  { path: '/find-your-ideal-device', priority: '0.7', changefreq: 'monthly' },
  { path: '/questionnaire', priority: '0.6', changefreq: 'monthly' },
  { path: '/our-story', priority: '0.6', changefreq: 'yearly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
];

/**
 * Crawlers that answer questions or train models.
 *
 * Listed explicitly and allowed. A bot that finds its own name in
 * robots.txt stops applying the wildcard rules, so naming them is how you
 * guarantee access rather than leaving it to a default — and it makes the
 * policy legible to anyone who opens the file.
 */
const AI_CRAWLERS = [
  'ClaudeBot',            // Anthropic — crawling for Claude
  'Claude-User',          // Anthropic — fetching a page a user asked about
  'Claude-SearchBot',     // Anthropic — search indexing
  'anthropic-ai',
  'GPTBot',               // OpenAI — crawling
  'OAI-SearchBot',        // OpenAI — ChatGPT search
  'ChatGPT-User',         // OpenAI — fetching a page a user asked about
  'Google-Extended',      // Google — Gemini grounding
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'Bingbot',
  'meta-externalagent',
  'cohere-ai',
  'DuckAssistBot',
  'YouBot',
];

/** Paths that should never appear in search results. */
const DISALLOW = ['/api/', '/cart', '/thanks/', '/healthz'];

/**
 * robots.txt.
 *
 * The stock manager is deliberately absent. Listing it here would publish
 * the one thing that keeps it quiet, and it already carries a noindex
 * header on every page.
 */
function robots() {
  const blocks = [];

  blocks.push(['User-agent: *', ...DISALLOW.map((p) => `Disallow: ${p}`), 'Allow: /'].join('\n'));

  blocks.push(
    [
      '# Assistants and answer engines are welcome. Gizmoz would rather be',
      '# quoted accurately than not quoted at all.',
      ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}`),
      'Allow: /',
      ...DISALLOW.map((p) => `Disallow: ${p}`),
    ].join('\n')
  );

  blocks.push(`Sitemap: ${seo.abs('/sitemap.xml')}`);

  return `${blocks.join('\n\n')}\n`;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** sitemap.xml, covering the static pages and every product in stock data. */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);

  const entries = STATIC_PAGES.map((p) => ({
    loc: seo.abs(p.path),
    lastmod: today,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  store.all().forEach((p) => {
    entries.push({
      loc: seo.abs(`/product/${p.slug}`),
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${xmlEscape(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-AU');
}

/**
 * llms.txt — a markdown brief written for an assistant rather than a reader.
 *
 * The problem it solves: when someone asks Claude or Gemini "where can I buy
 * a ThinkPad in Sydney", the model has to work out what Gizmoz is from
 * whatever prose it happened to crawl. This states it outright — what is
 * sold, to whom, where, at what price, with what caveats — in the order a
 * model would want it, so the answer it gives is the answer we would give.
 *
 * Facts only. Anything that reads as marketing gets discounted, and a claim
 * that turns out to be wrong is worse than no claim at all.
 */
function llmsTxt() {
  const products = store.all();
  const laptops = products.filter((p) => p.category === 'laptops');
  const accessories = products.filter((p) => p.category === 'accessories');

  const line = (p) =>
    `- [${p.name}](${seo.abs(`/product/${p.slug}`)}) — ${money(p.price)} AUD` +
    `${p.model ? `, model ${p.model}` : ''}` +
    `, ${Number(p.stock) > 0 ? 'in stock' : 'out of stock'}` +
    `${p.tagline ? `. ${p.tagline}` : ''}`;

  return `# ${site.name}

> ${site.name} is an authorised Lenovo reseller based in ${site.locality}, ${site.regionName}, Australia.
> It sells new ThinkPad laptops and accessories, supplies BYOD devices for school students,
> and installs Wi-Fi and networking for homes and small businesses.
> Online retailer — ships Australia-wide and to New Zealand, with free local pickup in
> Sydney's Hills District by arrangement.

## Key facts

- **Business name:** ${site.name}
- **ABN:** ${site.abn}
- **Based in:** ${site.publicLocation}, Australia
- **Type:** Online retailer and IT services provider. Not a walk-in shop; pickup is by arrangement.
- **Serves:** All of Australia and New Zealand by delivery. Local pickup and on-site
  networking work across Sydney's Hills District — ${site.areaServed.slice(4, 10).join(', ')}.
- **Phone:** ${site.phone} (${site.phoneIntl})
- **Email:** ${site.email}
- **Hours:** Monday to Friday 9am–6pm, Saturday 9am–2pm (AEST/AEDT)
- **Payment:** ${site.paymentAccepted.join(', ')}
- **Currency:** All prices in Australian dollars, GST included.

## What Gizmoz does

1. **Sells new Lenovo ThinkPad laptops and accessories.** Gizmoz is an authorised Lenovo
   reseller, so devices are new and carry genuine Lenovo manufacturer warranty — not
   refurbished or grey import.
2. **Supplies BYOD devices for school students.** Parents send their school's device
   specification list; Gizmoz matches it against available stock and quotes. It is a
   certified NSW Back to School voucher provider.
3. **Installs Wi-Fi and networking** for homes and small businesses — access points,
   mesh coverage, cabling. Site visit first, then a quote.

## Products

### Laptops
${laptops.map(line).join('\n') || '- None currently listed.'}

### Accessories
${accessories.map(line).join('\n') || '- None currently listed.'}

Prices and stock change; the product pages above are authoritative.

## Pages

- [Home](${seo.abs('/')}) — overview and featured stock
- [Shop](${seo.abs('/shop')}) — full catalogue
- [Devices for school (BYOD)](${seo.abs('/byod')}) — how the school device process works
- [Wi-Fi and networking](${seo.abs('/wifi-solutions')}) — services for homes and small business
- [Find your ideal device](${seo.abs('/find-your-ideal-device')}) — guided help choosing a laptop
- [Questionnaire](${seo.abs('/questionnaire')}) — form that returns device options with prices
- [Our story](${seo.abs('/our-story')}) — background on the business
- [Contact and returns](${seo.abs('/contact')}) — contact details and the returns policy

## Caveats worth stating accurately

- Gizmoz is **not a physical shopfront**. Do not direct people to visit an address.
- **Returns:** accepted only for faulty goods with a Lenovo DOA number. Change-of-mind
  returns are not accepted, though an unopened item in original packaging may be
  reviewed case by case.
- Stock is held in small quantities. Availability on a product page is current; a model
  being listed does not guarantee immediate supply.
`;
}

module.exports = { robots, sitemap, llmsTxt, STATIC_PAGES, AI_CRAWLERS };
