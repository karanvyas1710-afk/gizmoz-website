'use strict';

const { sizeAttrs } = require('../lib/imagesize');

const site = require('../lib/site');
const { page, banner, esc, icons } = require('../lib/layout');
const { field, choiceGroup, formFurniture, contactPills } = require('../lib/components');

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

function contact(query = {}) {
  const preset = site.queryTypes.includes(query.subject) ? query.subject : '';
  const about = query.about ? `I'd like to ask about: ${query.about}\n\n` : '';

  const body = `
${banner({
  eyebrow: 'Contact',
  title: 'Contact and Returns',
  lead:
    'Have a question? Our team is happy to help. Give us a call or send us a message and we’ll get back to ' +
    'you as soon as possible.',
})}

<section class="contact-page">
  <div class="wrap contact-grid">
    <div class="contact-intro">
      <h2>Talk to us</h2>
      <p>Gizmoz prides itself in its genuine customer service. If you have a query or would like a free
      consultation, our solution architects are available just for you. Please contact us on:</p>
      ${contactPills()}

      <dl class="contact-facts">
        <div><dt>${icons.phone} Phone</dt><dd><a href="tel:${site.phoneIntl}">${esc(site.phone)}</a><br><span class="muted">Our primary number — we answer fast.</span></dd></div>
        <div><dt>${icons.mail} Email</dt><dd><a href="mailto:${site.email}">${esc(site.email)}</a><br><span class="muted">If the phone is unavailable, email or DM us through our socials.</span></dd></div>
        <div><dt>${icons.check} Pickup address</dt><dd>${esc(site.address)}<br><span class="muted">Customers can collect purchases directly from our premises.</span></dd></div>
      </dl>

      <div class="contact-map">
        <iframe
          src="https://www.google.com/maps?q=${encodeURIComponent(site.address)}&amp;output=embed"
          title="Map showing Gizmoz at ${esc(site.address)}"
          width="600" height="360" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
          style="border:0"></iframe>
      </div>
      <p class="map-link"><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(
        site.address
      )}" target="_blank" rel="noopener">Open in Google Maps</a></p>
    </div>

    <div class="contact-form-wrap">
      <h2>Send us a message</h2>
      <form class="card-form" method="post" action="/api/contact" data-ajax-form>
        ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
        ${field({ name: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' })}
        ${field({ name: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel' })}
        ${field({ name: 'subject', label: 'What is this about?', type: 'select', required: true, options: site.queryTypes, value: preset })}
        ${field({ name: 'message', label: 'Your message', type: 'textarea', required: true, value: about, placeholder: 'Tell us what you need and we’ll come back to you.' })}
        ${formFurniture()}
        <button class="btn btn-lg" type="submit">Send message</button>
        <p class="form-small">We reply to everything, usually the same day.</p>
      </form>
    </div>
  </div>
</section>

<section class="returns-band">
  <div class="wrap">
    <h2>Returns</h2>
    <p>Returns are only accepted if the product is faulty and has a valid DOA number obtained from Lenovo by calling
    them on 13 53 66 86 or via support.lenovo.com. Once the DOA number is approved, please send the package back to
    our office and we will process the credit within 30 days.</p>
    <p>Note that returns are not accepted if you change your mind. On a case-to-case basis, we can review the return
    if the product is in the original packaging with the seal intact.</p>
    <p>Gizmoz is an Authorised Lenovo Reseller. Our Lenovo devices come with genuine Lenovo warranty. Message us if
    you have any questions.</p>
  </div>
</section>
`;
  return page({
    title: 'Contact and Returns',
    description: `Contact Gizmoz on ${site.phone} or ${site.email}. Pickup available from ${site.address}.`,
    body,
    current: '/contact',
  });
}

/* ------------------------------------------------------------------ */
/* Find your ideal device                                              */
/* ------------------------------------------------------------------ */

function findYourIdealDevice() {
  const body = `
${banner({
  eyebrow: 'Personalised service',
  title: 'Find Your Ideal Device',
  lead:
    'As a local small business, Gizmoz specialises in personalised services. We are able to help you choose the ' +
    'right device for work, BYOD, university and much more!',
})}

<section class="two-up">
  <div class="wrap two-up-inner">
    <article class="option-card">
      <span class="option-icon">${icons.phone}</span>
      <h2>Book an appointment</h2>
      <p>Book an appointment with us and you can meet us either virtually or face-to-face. We'll go through what you
      need, what you already have, and what's worth spending money on.</p>
      <ul class="ticks">
        <li>${icons.check} Free, no obligation</li>
        <li>${icons.check} Virtual or in person at ${esc(site.addressShort)}</li>
        <li>${icons.check} Bring your school spec list or work requirements</li>
      </ul>
      <a class="btn" href="/contact?subject=${encodeURIComponent('General query')}&amp;about=${encodeURIComponent('Booking an appointment')}">Book an appointment</a>
    </article>

    <article class="option-card option-card-alt">
      <span class="option-icon">${icons.laptop}</span>
      <h2>Fill out the questionnaire</h2>
      <p>Alternatively, fill out our short questionnaire and we'll come back to you with devices that are perfect for
      you. We'll even email you these device options with potential prices. We love giving value back to our
      customers.</p>
      <ul class="ticks">
        <li>${icons.check} Takes about two minutes</li>
        <li>${icons.check} Options emailed back with prices</li>
        <li>${icons.check} No account, no spam</li>
      </ul>
      <a class="btn" href="/questionnaire">Start the questionnaire</a>
    </article>
  </div>
</section>

<section class="contact-band">
  <div class="wrap">
    <h2>Would rather just talk?</h2>
    <p>That's completely fine — a lot of our customers do. Call or message us and we'll work it out with you.</p>
    ${contactPills()}
  </div>
</section>
`;
  return page({
    title: 'Find Your Ideal Device',
    description:
      'Book an appointment with Gizmoz or fill out a short questionnaire, and we will email you device options ' +
      'with prices for work, school, university or home.',
    body,
    current: '/find-your-ideal-device',
  });
}

/* ------------------------------------------------------------------ */
/* Questionnaire                                                       */
/* ------------------------------------------------------------------ */

function questionnaire() {
  const body = `
${banner({
  eyebrow: 'Two minutes, no account needed',
  title: 'Device Questionnaire',
  lead:
    'Tell us how the device will be used and what matters to you. We’ll email you a shortlist with prices — ' +
    'usually the same day.',
})}

<section class="form-page">
  <div class="wrap form-narrow">
    <form class="card-form" method="post" action="/api/questionnaire" data-ajax-form>

      <fieldset class="form-section">
        <legend><span class="sec-n">1</span> What is it for?</legend>
        ${field({
          name: 'purpose',
          label: 'Primary purpose',
          type: 'select',
          required: true,
          options: ['Home', 'Work', 'School (BYOD)', 'University', 'Something else'],
        })}
        ${field({
          name: 'purposeDetail',
          label: 'Anything specific about how it will be used?',
          type: 'textarea',
          rows: 3,
          placeholder: 'e.g. Year 7 BYOD, school requires a stylus and 8GB RAM',
        })}
      </fieldset>

      <fieldset class="form-section">
        <legend><span class="sec-n">2</span> Budget</legend>
        ${field({
          name: 'budget',
          label: 'Budget you have in mind',
          type: 'select',
          required: true,
          options: ['Under $600', '$600 – $1,000', '$1,000 – $1,500', '$1,500 – $2,500', 'Over $2,500', 'Not sure yet'],
        })}
      </fieldset>

      <fieldset class="form-section">
        <legend><span class="sec-n">3</span> Desired specifications</legend>
        ${choiceGroup({
          name: 'brands',
          legend: 'Preferred brands',
          options: ['Lenovo', 'HP', 'Dell', 'No preference'],
          help: 'Tick any that apply — we can source others too.',
        })}
        ${choiceGroup({
          name: 'features',
          legend: 'Features that matter',
          options: ['Touch screen', 'Pen / stylus', 'Long battery life', 'Lightweight', 'Ruggedised', 'Dedicated graphics'],
        })}
        <div class="field-row">
          ${field({ name: 'ram', label: 'RAM', type: 'select', options: ['8GB', '16GB', '32GB or more', 'Not sure'] })}
          ${field({ name: 'ssd', label: 'Storage (SSD)', type: 'select', options: ['256GB', '512GB', '1TB or more', 'Not sure'] })}
        </div>
        <div class="field-row">
          ${field({ name: 'processor', label: 'Processor', type: 'select', options: ['Intel Core i5 / Ryzen 5', 'Intel Core i7 / Ryzen 7', 'Chromebook-class', 'Not sure'] })}
          ${field({ name: 'battery', label: 'Battery life needed', type: 'select', options: ['A half day is fine', 'A full school/work day', 'As long as possible', 'Not sure'] })}
        </div>
        ${field({ name: 'notes', label: 'Anything else we should know?', type: 'textarea', rows: 4 })}
      </fieldset>

      <fieldset class="form-section">
        <legend><span class="sec-n">4</span> Where do we send the options?</legend>
        ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
        <div class="field-row">
          ${field({ name: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' })}
          ${field({ name: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel' })}
        </div>
        ${field({ name: 'contactPreference', label: 'Best way to reach you', type: 'select', options: ['Email', 'Phone call', 'SMS', 'Either is fine'] })}
      </fieldset>

      ${formFurniture()}
      <button class="btn btn-lg" type="submit">Send my answers</button>
      <p class="form-small">We only use your details to reply to this enquiry. No newsletters, no sharing.</p>
    </form>
  </div>
</section>
`;
  return page({
    title: 'Device Questionnaire',
    description:
      'Answer a few questions about how you will use your device and Gizmoz will email you a shortlist of ' +
      'laptops with prices.',
    body,
    current: '/find-your-ideal-device',
  });
}

/* ------------------------------------------------------------------ */
/* Cart / order enquiry                                                */
/* ------------------------------------------------------------------ */

function cart() {
  const body = `
${banner({
  eyebrow: 'Your basket',
  title: 'Request an Order',
  lead:
    'Add what you need, send it through, and we’ll confirm stock and reply with a total and payment options. ' +
    'Nothing is charged here.',
})}

<section class="cart-page">
  <div class="wrap cart-grid">
    <div class="cart-items" data-cart-items>
      <p class="cart-empty">Your basket is empty. <a href="/shop">Have a look at the store →</a></p>
    </div>

    <aside class="cart-side">
      <div class="cart-summary">
        <h2>Summary</h2>
        <p class="cart-total">Estimated total <strong data-cart-total>$0</strong></p>
        <p class="muted">Prices include GST. Shipping to Australia and New Zealand is quoted when we reply, or
        collect for free from ${esc(site.addressShort)}.</p>
      </div>

      <form class="card-form" method="post" action="/api/order" data-ajax-form data-cart-form hidden>
        <h2>Where do we send the confirmation?</h2>
        ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
        ${field({ name: 'email', label: 'Email address', type: 'email', required: true, autocomplete: 'email' })}
        ${field({ name: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel' })}
        ${field({ name: 'fulfilment', label: 'Pickup or delivery?', type: 'select', required: true, options: [`Pickup from ${site.addressShort}`, 'Deliver to me'] })}
        ${field({ name: 'notes', label: 'Anything else?', type: 'textarea', rows: 3 })}
        <input type="hidden" name="items" data-cart-payload>
        ${formFurniture()}
        <button class="btn btn-lg" type="submit">Send order request</button>
        <p class="form-small">We'll confirm stock and reply with a total and payment options. You're not charged
        anything on this page.</p>
      </form>
    </aside>
  </div>
</section>
`;
  return page({
    title: 'Your Basket',
    description: 'Request an order from Gizmoz. We confirm stock and reply with a total and payment options.',
    body,
    current: '/shop',
  });
}

/* ------------------------------------------------------------------ */
/* Thank-you and 404                                                   */
/* ------------------------------------------------------------------ */

function thanks(kind) {
  const copy = {
    contact: ['Message received', 'Thanks for getting in touch — we’ll reply as soon as we can, usually the same day.'],
    questionnaire: ['Answers received', 'Thanks! We’ll put a shortlist together and email you device options with prices.'],
    order: ['Order request received', 'Thanks! We’ll confirm stock and reply with a total and payment options.'],
  }[kind] || ['Thank you', 'We’ll be in touch shortly.'];

  const body = `
<section class="thanks">
  <div class="wrap">
    <span class="thanks-tick">${icons.check}</span>
    <h1>${esc(copy[0])}</h1>
    <p>${esc(copy[1])}</p>
    <p class="muted">If it's urgent, call us on <a href="tel:${site.phoneIntl}">${esc(site.phone)}</a>.</p>
    <div class="story-actions">
      <a class="btn" href="/shop">Back to the store</a>
      <a class="btn btn-ghost" href="/">Home</a>
    </div>
  </div>
</section>`;
  return page({ title: copy[0], description: copy[1], body, current: '/', strip: false });
}

function notFound() {
  const body = `
<section class="thanks">
  <div class="wrap">
    <h1>Page not found</h1>
    <p>That link doesn't lead anywhere. It may have moved, or the product may have sold out and been retired.</p>
    <div class="story-actions">
      <a class="btn" href="/shop">Browse the store</a>
      <a class="btn btn-ghost" href="/contact">Ask us</a>
    </div>
  </div>
</section>`;
  return page({ title: 'Page not found', description: 'That page could not be found.', body, current: '/', strip: false });
}

module.exports = { contact, findYourIdealDevice, questionnaire, cart, thanks, notFound };
