'use strict';

const site = require('./site');

/**
 * Question-and-answer content.
 *
 * One source for both the visible `<details>` blocks and the FAQPage
 * structured data, because Google penalises markup whose answers are not
 * on the page, and because two copies of the same answer drift apart.
 *
 * These are written the way someone actually types a question into Google
 * or asks an assistant, and answered in complete sentences that make sense
 * quoted on their own — an assistant lifts one answer out of context, so
 * each has to carry its own subject rather than starting with "yes, we do".
 *
 * Answers are plain HTML; keep it to <p>, <ul>, <li> and <a>.
 */

const PHONE = site.phone;
const EMAIL = site.email;

/* ------------------------------------------------------------------ */
/* Devices for school                                                  */
/* ------------------------------------------------------------------ */

const byod = [
  [
    'What is a BYOD laptop, and how do I know which one my child’s school needs?',
    `<p>BYOD stands for Bring Your Own Device — most NSW high schools now ask families to supply a
     laptop that meets a published minimum specification, covering things like processor, memory,
     storage, screen size and battery life. Every school's list is slightly different.</p>
     <p>You do not need to decode it yourself. Send the school's specification list to Gizmoz at
     <a href="mailto:${EMAIL}">${EMAIL}</a> or call <a href="tel:${site.phoneIntl}">${PHONE}</a>,
     and we will check it against available stock and come back with two or three devices that
     meet it, with real prices.</p>`,
  ],
  [
    'Can I use the NSW Back to School voucher at Gizmoz?',
    `<p>Yes. Gizmoz is a certified NSW Back to School provider, so the voucher can be redeemed
     against a laptop purchase. On top of the voucher's own value, Gizmoz is currently offering a
     further $50 off when a $150 voucher is used.</p>`,
  ],
  [
    'What kind of laptop suits primary school, high school and university?',
    `<p>For <strong>primary school</strong>, a heavy-duty Chromebook or touchscreen device is usually
     the right call — durability matters more than performance at that age.</p>
     <p>For <strong>high school</strong>, a lightweight ThinkPad with all-day battery and a rugged
     chassis handles a full timetable without becoming a burden to carry.</p>
     <p>For <strong>university</strong>, it depends on the course: coursework runs on anything, but
     CAD, engineering and software subjects need more processor and memory. Tell us the degree and
     we will tell you what it actually needs.</p>`,
  ],
  [
    'Are the laptops new, and do they come with warranty?',
    `<p>All laptops sold by Gizmoz are new. Gizmoz is an authorised Lenovo reseller, so devices are
     supplied through official Lenovo channels and carry genuine Lenovo manufacturer warranty —
     they are not refurbished, ex-lease or grey import. Warranty length varies by model; the
     ThinkPad L13 Gen 2, for example, comes with three years.</p>`,
  ],
  [
    'How long does it take to get a device once I ask?',
    `<p>Gizmoz replies to enquiries the same day in most cases, usually with device options and
     prices by email. How quickly the laptop itself arrives depends on whether the model is in
     stock — current stock levels are shown on each product page — or has to come from the
     distributor. We tell you which before you commit.</p>`,
  ],
  [
    'Can I pick the laptop up, or do you deliver?',
    `<p>Both. Free local pickup is available in ${site.locality} and across Sydney's Hills District
     by arrangement, and Gizmoz ships anywhere in Australia and New Zealand. You choose at checkout,
     and we confirm the pickup details once the order is placed.</p>`,
  ],
];

/* ------------------------------------------------------------------ */
/* Wi-Fi and networking                                                */
/* ------------------------------------------------------------------ */

const wifi = [
  [
    'Does Gizmoz install Wi-Fi for homes and small businesses?',
    `<p>Yes. Gizmoz installs Wi-Fi and networking for both homes and small businesses — access
     points, mesh coverage, switching and cabling. The work starts with a site visit rather than a
     phone quote, because coverage problems are almost always caused by the building rather than
     the hardware.</p>`,
  ],
  [
    'Which areas does Gizmoz cover for on-site networking work?',
    `<p>On-site work covers Sydney's Hills District and surrounding suburbs, including
     ${site.areaServed.slice(4, 10).join(', ')}. If you are outside that area, call
     <a href="tel:${site.phoneIntl}">${PHONE}</a> and ask — it is often still workable.</p>`,
  ],
  [
    'How much does a Wi-Fi installation cost?',
    `<p>There is no fixed price, because the honest answer depends on the size and construction of
     the building and how many access points it needs. Gizmoz comes out, looks at the property,
     and then quotes — so the number you are given is the number you pay, rather than an estimate
     that moves once work starts.</p>`,
  ],
  [
    'What is the difference between a mesh system and proper access points?',
    `<p>A mesh system relays the signal wirelessly between nodes, which is quick to set up but
     costs you bandwidth at every hop. Cabled access points each get a full-speed connection back
     to the router, so coverage stays fast at the far end of the house.</p>
     <p>Mesh suits apartments and smaller homes. Access points suit double-brick houses, multi-storey
     buildings and anywhere people actually work. Gizmoz specifies whichever the building calls for.</p>`,
  ],
  [
    'Why is my Wi-Fi slow in some rooms even though the plan is fast?',
    `<p>Internet plan speed and Wi-Fi coverage are different problems. A fast NBN connection still
     has to get through brick, foil insulation, concrete and distance, and a single router in the
     corner of the house will not reach the other end of it. Upgrading the plan does not fix that;
     putting the signal closer to where people sit does.</p>`,
  ],
];

/* ------------------------------------------------------------------ */
/* About the business                                                  */
/* ------------------------------------------------------------------ */

const general = [
  [
    'Where is Gizmoz based, and can I visit the shop?',
    `<p>Gizmoz operates from ${site.publicLocation}, in Sydney's Hills District. It is an online
     retailer rather than a walk-in shop, so there is no storefront to browse — orders are placed
     online, by phone on <a href="tel:${site.phoneIntl}">${PHONE}</a>, or by email at
     <a href="mailto:${EMAIL}">${EMAIL}</a>. Free local pickup is available by arrangement, and we
     confirm where and when once your order is placed.</p>`,
  ],
  [
    'Is Gizmoz an authorised Lenovo reseller?',
    `<p>Yes. Gizmoz is an Authorised Lenovo PC Partner, which means devices are supplied through
     official Lenovo channels and come with genuine Lenovo manufacturer warranty. Gizmoz's ABN is
     ${site.abn}.</p>`,
  ],
  [
    'Are the laptops new or refurbished?',
    `<p>New. Every laptop Gizmoz sells is a new device supplied through the Lenovo partnership, with
     full manufacturer warranty. Gizmoz does not sell refurbished, ex-lease or grey-import stock.</p>`,
  ],
  [
    'Does Gizmoz deliver outside Sydney?',
    `<p>Yes. Gizmoz ships anywhere in Australia and to New Zealand. Local pickup is only available
     in Sydney's Hills District, but delivery is not geographically limited within those two
     countries.</p>`,
  ],
  [
    'How do I pay?',
    `<p>Gizmoz accepts ${site.paymentAccepted.join(', ').toLowerCase()}. Orders placed through the
     website are requests rather than instant checkouts — Gizmoz confirms stock first, then replies
     with a total and payment options, so you are never charged for something that turns out to be
     unavailable. All prices are in Australian dollars and include GST.</p>`,
  ],
  [
    'What is the returns policy?',
    `<p>Returns are accepted for faulty products that have a valid DOA number from Lenovo, obtained
     by calling Lenovo on 13 53 66 86 or through support.lenovo.com. Once the DOA number is
     approved, send the package back and the credit is processed within 30 days.</p>
     <p>Change-of-mind returns are not accepted. If the product is unopened and the seal is intact,
     Gizmoz will review the return case by case.</p>`,
  ],
];

/* ------------------------------------------------------------------ */
/* Home page — a short cross-section of the above                      */
/* ------------------------------------------------------------------ */

const home = [general[0], general[1], byod[1], general[3], wifi[0], general[5]];

module.exports = { byod, wifi, general, home };
