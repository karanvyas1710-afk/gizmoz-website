'use strict';

const site = require('../lib/site');
const { page, banner, esc, icons } = require('../lib/layout');
const { splitBlock, contactPills } = require('../lib/components');

/* ------------------------------------------------------------------ */
/* Our Story                                                           */
/* ------------------------------------------------------------------ */

function ourStory() {
  const body = `
${banner({
  eyebrow: 'Behind Gizmoz',
  title: 'Our Story',
  lead:
    'A family-run IT service provider with a combined 30 years in the industry — and a habit of picking up the ' +
    'phone when you call.',
})}

${splitBlock({
  eyebrow: 'Who we are',
  title: 'About Gizmoz',
  body: `<p>Gizmoz is a family-run IT service provider with a combined 30 years of experience in the industry.
  Our team is committed to providing our customers with top-notch service, and we pride ourselves on our ability
  to offer personalised solutions to meet your needs.</p>
  <p>We are a technology solutions provider based in Sydney. As a family-run small business we make sure customers
  are thoroughly satisfied with their purchases and receive as much aid and transparency as possible. We source our
  products from a variety of wholesalers and distributors to give you the best value for your money.</p>`,
  image: 'site/about-laptop.png',
  alt: 'Lenovo ThinkPad on a desk',
})}

${splitBlock({
  eyebrow: '2019',
  title: 'Our origin story',
  body: `<p>Our company's story began in 2019, during the Covid-19 pandemic when the world became increasingly
  digital, leading to a surge in demand for online schooling and work-from-home setups. As our friends and family
  sought our assistance in finding value-driven IT solutions, we recognised a gap in the market for personalised
  support and faster shipping times.</p>
  <p>We were already the tech specialists within close family and friend groups, helping with device selection and
  purchase. We began to reach out and formed a platform from which we could serve the greater community.</p>`,
  image: 'site/journey-laptop.png',
  alt: 'Lenovo ThinkPad Yoga',
  reverse: true,
})}

<section class="value-band">
  <div class="wrap">
    <h2>Our approach to service</h2>
    <p class="value-lead">We're all about making things easy and hassle-free for you. As an authorised Lenovo vendor,
    we source our devices from distributors, allowing us to offer better-priced stock than competing retailers.</p>
    <div class="value-grid">
      <div class="value-card">${icons.laptop}<h3>A wide selection</h3><p>Lenovo, HP and Dell, from Chromebooks to foldables — and anything else we can order in.</p></div>
      <div class="value-card">${icons.wifi}<h3>Fast Wi-Fi and networking</h3><p>Access points, cabling and dead-spot fixes for homes and commercial workspaces.</p></div>
      <div class="value-card">${icons.briefcase}<h3>Personalised workspaces</h3><p>Work-from-home setups specified around how you actually work, not a catalogue bundle.</p></div>
      <div class="value-card">${icons.check}<h3>Competitive pricing</h3><p>Distributor pricing and prompt response times — usually the same day.</p></div>
    </div>
  </div>
</section>

<section class="story-close">
  <div class="wrap">
    <h2>The birth of Gizmoz</h2>
    <p>As the scope of our services grew, we established Gizmoz in early 2022 to connect with a wider customer base
    and provide high-quality IT solutions to individuals and businesses alike. Our goal is to take the hassle out of
    tech and give you a smooth, stress-free experience.</p>
    <div class="story-actions">
      <a class="btn" href="/shop">Browse the store</a>
      <a class="btn btn-ghost" href="/contact">Talk to us</a>
    </div>
  </div>
</section>
`;
  return page({
    title: 'Our Story',
    description:
      'Gizmoz is a family-run IT service provider in Sydney with a combined 30 years of experience, founded in ' +
      '2019 and established as Gizmoz in 2022.',
    body,
    current: '/our-story',
  });
}

/* ------------------------------------------------------------------ */
/* Personal Solutions                                                  */
/* ------------------------------------------------------------------ */

function personalSolutions() {
  const body = `
${banner({
  eyebrow: 'What we do',
  title: 'Personal Solutions',
  lead:
    'As a local small business, Gizmoz specialises in personalised service. We can help you choose the right ' +
    'device for work, BYOD, university and much more.',
})}

<section class="intro">
  <div class="wrap">
    <p class="lede">Since COVID, demand for laptops and PCs has skyrocketed and we understand how difficult it is to
    navigate through the thousands of websites to find the right device for the best value. Gizmoz simply takes all
    the stress away from this and helps you focus on the things that matter.</p>
    <p>We specialise in finding and ordering any device, from BYOD devices for your children to PCs for work. If you
    are looking for something beyond the stock we have on hand then do not hesitate to give us a call — our solution
    architect will find the perfect laptop for you at a price you can't say no to.</p>
  </div>
</section>

${splitBlock({
  eyebrow: 'For school',
  title: 'Bring Your Own Device',
  body: `<p>With a thorough understanding of school technology systems, Gizmoz is able to find the best laptop for
  your child at the best price, ensuring that you get the best value and your child gets the best possible tools for
  their education. Simply hand us your school tech specifications list and our solution architects will find the
  perfect device.</p>`,
  image: 'site/student.jpg',
  alt: 'Student working on a laptop',
  cta: { href: '/byod', label: 'More on BYOD' },
})}

${splitBlock({
  eyebrow: 'For work',
  title: 'Laptops and PCs for work',
  body: `<p>Since COVID, demand for work laptops and PCs has skyrocketed and we understand how difficult it is to
  navigate through the thousands of websites, prices and devices. Gizmoz simply takes all the stress away from this
  and helps you focus on the things that matter. Give us a call and let us help you find the best deal on a laptop
  or PC for work.</p>`,
  image: 'site/family-wfh.jpg',
  alt: 'Working from home at a desk',
  cta: { href: '/find-your-ideal-device', label: 'Find your ideal device' },
  reverse: true,
})}

${splitBlock({
  eyebrow: 'Around the house',
  title: 'Wi-Fi and networking',
  body: `<p>Slow corners of the house, a garage office that never gets signal, a shopfront that needs proper
  coverage — our technicians install access points, run cabling and configure the hardware so it stays fixed.</p>`,
  image: 'site/service-desk.jpg',
  alt: 'Talking through options in person',
  cta: { href: '/wifi-solutions', label: 'See Wi-Fi solutions' },
})}

<section class="contact-band">
  <div class="wrap">
    <h2>Talk to a solution architect</h2>
    <p>Gizmoz prides itself in its genuine customer service. If you have a query or would like a free consultation,
    our solution architects are available just for you. Please contact us on:</p>
    ${contactPills()}
  </div>
</section>
`;
  return page({
    title: 'Personal Solutions',
    description:
      'Personalised device selection from Gizmoz — BYOD devices for school, laptops and PCs for work, university ' +
      'setups and Wi-Fi solutions across Sydney.',
    body,
    current: '/personal-solutions',
  });
}

/* ------------------------------------------------------------------ */
/* BYOD                                                                */
/* ------------------------------------------------------------------ */

function byod() {
  const body = `
${banner({
  eyebrow: 'Devices for school',
  title: 'Bring Your Own Device',
  lead:
    'Hand us your school’s tech specification list. We’ll come back with devices that meet it — and what ' +
    'each one actually costs.',
})}

<section class="intro">
  <div class="wrap">
    <p class="lede">At Gizmoz, we understand that finding the right laptop for your child can be both time-consuming
    and expensive. With years of experience helping families with BYOD devices and in the laptop vending scene, we
    have the expertise to help. Our goal is to save you time and money when searching for a laptop for your child.</p>
    <p>By relying on us, you can spend more time with your family and focus on what's important. As a certified NSW
    Back to School provider, we can also offer up to an additional $150 off any purchase.</p>
    <p>Our range of laptops caters to students at all levels of education and includes notable models such as the
    Google Chromebook, Lenovo ThinkPad X1 Carbon and ThinkPad Yoga. You can contact us directly or fill out our
    questionnaire to find the perfect device for your child.</p>
  </div>
</section>

<section class="steps">
  <div class="wrap">
    <h2>How it works</h2>
    <ol class="step-list">
      <li><span class="step-n">1</span><h3>Send us the list</h3><p>Email or message the school's BYOD specification — or just tell us the year group.</p></li>
      <li><span class="step-n">2</span><h3>We match it</h3><p>We check the spec against what our distributors hold and shortlist two or three devices.</p></li>
      <li><span class="step-n">3</span><h3>You get prices</h3><p>We email the options with real prices, including any Back to School voucher discount.</p></li>
      <li><span class="step-n">4</span><h3>Pick up or delivered</h3><p>Collect from Homebush West or we ship it anywhere in Australia and New Zealand.</p></li>
    </ol>
  </div>
</section>

<section class="age-band">
  <div class="wrap">
    <h2>Whatever the age group</h2>
    <div class="age-grid">
      <div class="age-card">${icons.backpack}<h3>Primary school</h3><p>Heavy-duty Chromebooks and touchscreen devices built to survive a six-year-old's backpack.</p></div>
      <div class="age-card">${icons.cap}<h3>High school</h3><p>Lightweight ThinkPads with the battery life and durability to run a full timetable.</p></div>
      <div class="age-card">${icons.briefcase}<h3>University</h3><p>All-in-one machines that handle coursework, CAD or coding without being a burden to carry.</p></div>
    </div>
  </div>
</section>

<section class="cta-band">
  <div class="wrap cta-band-inner">
    <div>
      <h2>Ready to find the right device?</h2>
      <p>Fill out the short questionnaire and we'll email you device options with prices.</p>
    </div>
    <a class="btn btn-light" href="/questionnaire">Start the questionnaire</a>
  </div>
</section>
`;
  return page({
    title: 'Devices for School (BYOD)',
    description:
      'BYOD devices for school from Gizmoz in Sydney. Send us your school’s tech specification list and we ' +
      'will find the right laptop at the right price. Certified NSW Back to School provider.',
    body,
    current: '/byod',
  });
}

/* ------------------------------------------------------------------ */
/* Wi-Fi solutions                                                     */
/* ------------------------------------------------------------------ */

function wifiSolutions() {
  const services = [
    ['Wi-Fi access points', 'Properly placed access points so coverage reaches the whole house or shopfront.'],
    ['Connectivity boosting', 'Diagnose the dead spots and fix them with mesh, repeaters or cabling — whichever actually solves it.'],
    ['Data cabling', 'Run and terminate Ethernet to the rooms that need a stable wired connection.'],
    ['Router and switch setup', 'Configured, secured and labelled, with the passwords written down for you.'],
    ['Commercial workspaces', 'Coverage plans for offices, clinics and retail spaces, including guest networks.'],
    ['Work-from-home setups', 'The whole desk — device, dock, monitors, network — specified and installed together.'],
  ];

  const body = `
${banner({
  eyebrow: 'Residential and commercial',
  title: 'Wi-Fi and Networking Solutions',
  lead:
    'Gizmoz offers Wi-Fi and networking solutions that will enhance your residential and commercial workspaces. ' +
    'Our experienced technicians come to you.',
})}

<section class="service-band">
  <div class="wrap">
    <h2>What our technicians can do</h2>
    <div class="service-grid">
      ${services
        .map(
          ([t, d]) =>
            `<div class="service-card"><span class="service-icon">${icons.wifi}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`
        )
        .join('')}
    </div>
  </div>
</section>

${splitBlock({
  eyebrow: 'How we work',
  title: 'We come out, look, then quote',
  body: `<p>Every house and every shopfront is different, so we don't quote blind. Tell us the problem — the back
  room with no signal, the office that drops calls — and we'll arrange a time to look at it, either virtually or
  on site.</p>
  <p>You get a fixed price before any work starts, and we leave the network documented so the next person who
  touches it knows what's what.</p>`,
  image: 'site/service-desk.jpg',
  alt: 'Talking through options in person',
  cta: { href: '/contact?subject=Wi-Fi%20and%20networking%20solutions', label: 'Click to see how we can help' },
  reverse: true,
})}

<section class="contact-band">
  <div class="wrap">
    <h2>Book a technician</h2>
    <p>If you have any doubts or require a consultation, the team at Gizmoz is more than happy to have a friendly
    chat and resolve all issues:</p>
    ${contactPills()}
  </div>
</section>
`;
  return page({
    title: 'Wi-Fi and Networking Solutions',
    description:
      'Wi-Fi and networking solutions from Gizmoz — access point installation, connectivity boosting, data ' +
      'cabling and router setup for homes and businesses across Sydney.',
    body,
    current: '/wifi-solutions',
  });
}

module.exports = { ourStory, personalSolutions, byod, wifiSolutions };
