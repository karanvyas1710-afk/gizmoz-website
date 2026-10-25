'use strict';

/**
 * Single source of truth for everything that is business fact rather than
 * markup: contact details, external links, the promo banner and the nav tree.
 * Anything the owners are likely to want to change lives here.
 */

const site = {
  name: 'Gizmoz',
  legalName: 'Gizmoz',
  tagline: 'Your Technology Solutions Partner',
  abn: '47 962 128 615',
  phone: '0424 620 511',
  phoneIntl: '+61424620511',
  email: 'gizmozau@yahoo.com',

  /**
   * The canonical origin, with no trailing slash. Everything that needs an
   * absolute URL — canonical tags, sitemap, Open Graph, structured data —
   * builds on this, so a domain change is one environment variable.
   */
  url: (process.env.SITE_URL || 'https://gizmoz.au').replace(/\/+$/, ''),

  /**
   * Gizmoz trades online and ships Australia-wide; the registered address is
   * residential, so only the suburb is ever published. `address` is kept for
   * invoices and order emails and must not be rendered into a public page.
   */
  address: '15 Blarneystone Avenue, Rouse Hill, NSW',
  addressShort: 'Rouse Hill',
  locality: 'Rouse Hill',
  region: 'NSW',
  regionName: 'New South Wales',
  postcode: '2155',
  country: 'AU',
  publishStreetAddress: false,

  /** Where Gizmoz actually sells and services, broadest first. */
  areaServed: [
    'Australia',
    'New Zealand',
    'Sydney',
    'The Hills District',
    'Rouse Hill',
    'Kellyville',
    'Castle Hill',
    'Baulkham Hills',
    'Norwest',
    'Blacktown',
    'Parramatta',
  ],

  /** When someone can expect an answer. Used for structured data. */
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { days: ['Saturday'], opens: '09:00', closes: '14:00' },
  ],

  /** Accepted ways to pay, for structured data and the FAQ answers. */
  paymentAccepted: ['Bank transfer', 'Credit card', 'Debit card', 'PayID'],
  currency: 'AUD',

  social: {
    instagram: 'https://www.instagram.com/gizmoz_au/',
    facebook: 'https://www.facebook.com/gizmozau',
    ebay: 'https://www.ebay.com.au/usr/gizmozau',
    messenger: 'https://m.me/gizmozau',
  },

  /**
   * Home-page promo strip. Set `active: false` to hide it entirely once the
   * back-to-school offer is over — nothing else needs editing.
   */
  promo: {
    active: true,
    text:
      'Shopping for the new school season? If you’re using a NSW Government ' +
      '“Back to School Voucher” worth $150, we’ll offer an additional $50 off!',
    cta: 'Click here to shop now',
    href: '/shop',
  },

  /** Enquiry reasons offered on the contact form. */
  queryTypes: [
    'General query',
    'BYOD (devices for school)',
    'Wi-Fi and networking solutions',
    'Order status',
    'Other',
  ],

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    {
      label: 'Personal Solutions',
      href: '/personal-solutions',
      children: [
        { label: 'Devices for school (BYOD)', href: '/byod' },
        { label: 'Wi-Fi and networking', href: '/wifi-solutions' },
        { label: 'Find your ideal device', href: '/find-your-ideal-device' },
      ],
    },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Contact', href: '/contact' },
  ],
};

/** The suburb-level location that is safe to show anywhere. */
site.publicLocation = `${site.locality}, ${site.region} ${site.postcode}`;

module.exports = site;
