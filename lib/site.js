'use strict';

/**
 * Single source of truth for everything that is business fact rather than
 * markup: contact details, external links, the promo banner and the nav tree.
 * Anything the owners are likely to want to change lives here.
 */

const site = {
  name: 'Gizmoz',
  tagline: 'Your Technology Solutions Partner',
  abn: '47 962 128 615',
  phone: '0424 620 511',
  phoneIntl: '+61424620511',
  email: 'gizmozau@yahoo.com',
  address: 'U15, 62/64 Marlborough Road, Homebush West, NSW',
  addressShort: 'Homebush West, Sydney',

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

module.exports = site;
