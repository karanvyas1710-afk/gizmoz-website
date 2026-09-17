'use strict';

const { sizeAttrs } = require('../lib/imagesize');

const site = require('../lib/site');
const { page, esc, icons, wordmark } = require('../lib/layout');
const { productGrid, splitBlock, contactPills } = require('../lib/components');

module.exports = function home(products) {
  const topPicks = products.filter((p) => p.featured).slice(0, 3);

  const promo = site.promo.active
    ? `<div class="promo">
        <p>${esc(site.promo.text)}</p>
        <a class="btn btn-light" href="${site.promo.href}">${esc(site.promo.cta)}</a>
      </div>`
    : '';

  const body = `
<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text">
      <h1 class="hero-title">${wordmark({ alt: `Gizmoz — ${site.tagline}`, eager: true })}</h1>
      <div class="hero-actions">
        <a class="btn" href="/shop">Shop now</a>
        <a class="btn btn-ebay" href="${site.social.ebay}" target="_blank" rel="noopener">
          <span class="ebay-word"><b class="e">e</b><b class="b">b</b><b class="a">a</b><b class="y">y</b></span>
        </a>
      </div>
      ${promo}
    </div>
    <div class="hero-media">
      <img src="/images/site/hero-laptop.png" alt="Lenovo ThinkPad running Windows 11"${sizeAttrs('site/hero-laptop.png')} fetchpriority="high">
    </div>
  </div>
</section>

<section class="intro">
  <div class="wrap">
    <h2>Trusted technology, sourced properly</h2>
    <p>Gizmoz is your trusted technology solutions provider in Sydney. As a family-run business, our focus is on
    delivering personalised customer satisfaction. With a combined 30 years of IT experience, we offer a variety of top
    laptop brands including Lenovo, Dell and HP, sourced from multiple wholesale distributors to ensure the best value
    for your money. We also specialise in BYOD (Bring Your Own Device), work-from-home setups, and devices for
    university students.</p>
    <div class="intro-badges">
      <img src="/images/site/lenovo-pc-partner.png" alt="Lenovo Authorized PC Partner"${sizeAttrs('site/lenovo-pc-partner.png')} loading="lazy">
      <ul>
        <li>${icons.check} Authorised Lenovo reseller — genuine Lenovo warranty</li>
        <li>${icons.check} Family-run, based in Sydney since 2019</li>
        <li>${icons.check} Pick up locally or ship across Australia and NZ</li>
      </ul>
    </div>
  </div>
</section>

<section class="top-picks">
  <div class="wrap">
    <div class="section-head">
      <h2>Top picks</h2>
      <a class="text-link" href="/shop">See the whole store →</a>
    </div>
    ${productGrid(topPicks, 'grid-3')}
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-band-inner">
    <div>
      <h2>Not sure what's right for you?</h2>
      <p>Answer a few questions and we'll come back with devices that actually suit you — and what they'd cost.</p>
    </div>
    <a class="btn btn-light" href="/find-your-ideal-device">Find your ideal device</a>
  </div>
</section>

${splitBlock({
  eyebrow: 'Devices for school',
  title: 'Bring Your Own Device',
  body: `<p>At Gizmoz, we're committed to helping families prepare for the school season with our specialised Bring
  Your Own Device (BYOD) services. We offer a range of solutions to meet your unique needs, from all-in-one devices
  for your 18-year-old to heavy-duty Chromebooks for your 6-year-old. Whatever your requirements, we've got you
  covered.</p>`,
  image: 'site/student.jpg',
  alt: 'Student working on a laptop at home',
  cta: { href: '/byod', label: 'Learn more about BYOD' },
})}

${splitBlock({
  eyebrow: 'Around the home and office',
  title: 'Networking and Wi-Fi solutions',
  body: `<p>Gizmoz offers Wi-Fi and networking solutions that will enhance your residential and commercial
  workspaces. Our experienced technicians can:</p>
  <ul class="ticks">
    <li>${icons.check} Set up Wi-Fi access points</li>
    <li>${icons.check} Boost Wi-Fi connectivity into dead spots</li>
    <li>${icons.check} Run and terminate data cabling</li>
    <li>${icons.check} Configure routers, switches and mesh systems</li>
  </ul>`,
  image: 'site/family-wfh.jpg',
  alt: 'Parent and child working at a home desk',
  cta: { href: '/wifi-solutions', label: 'Click to see how we can help' },
  reverse: true,
})}

<section class="follow">
  <div class="wrap">
    <h2>Latest from Gizmoz</h2>
    <p class="follow-lead">To be up to date with our latest offers and deals, feel free to follow our Facebook and
    Instagram pages:</p>
    <div class="follow-actions">
      <a class="btn btn-social" href="${site.social.instagram}" target="_blank" rel="noopener">${icons.instagram}<span>Instagram</span></a>
      <a class="btn btn-social" href="${site.social.facebook}" target="_blank" rel="noopener">${icons.facebook}<span>Facebook</span></a>
      <a class="btn btn-social btn-social-ebay" href="${site.social.ebay}" target="_blank" rel="noopener"><span>Buy on eBay</span></a>
    </div>
    <div class="ig-embed">
      <blockquote class="instagram-media" data-instgrm-permalink="${site.social.instagram}" data-instgrm-version="14">
        <a href="${site.social.instagram}" target="_blank" rel="noopener">View our latest post on Instagram</a>
      </blockquote>
    </div>
  </div>
</section>

${splitBlock({
  eyebrow: 'Get in touch',
  title: 'Contact us',
  body: `<p>Gizmoz prides itself in its genuine customer service. If you have a query or would like a free
  consultation, our solution architects are available just for you. Please contact us on:</p>
  <p class="contact-lines">
    <a href="tel:${site.phoneIntl}">${esc(site.phone)}</a><br>
    <a href="mailto:${site.email}">${esc(site.email)}</a>
  </p>`,
  image: 'site/contact-fold.png',
  alt: 'Lenovo ThinkPad X1 Fold',
  cta: { href: '/contact', label: 'More info' },
})}
`;

  return page({
    title: null,
    description:
      'Gizmoz is a family-run technology solutions provider in Sydney. Authorised Lenovo reseller selling ' +
      'laptops and accessories, BYOD school devices, work-from-home setups and Wi-Fi solutions.',
    body,
    current: '/',
  });
};
