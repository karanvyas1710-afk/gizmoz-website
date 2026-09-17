'use strict';

const { esc, money, icons } = require('./layout');
const { sizeAttrs } = require('./imagesize');

function stockLabel(stock) {
  if (stock <= 0) return `<span class="stock stock-out">Out of stock</span>`;
  return `<span class="stock">In stock: ${stock}</span>`;
}

/** The 350x350 white product card from the shop grid. */
function productCard(p) {
  const sale = p.wasPrice ? `<s>${money(p.wasPrice)}</s> ` : '';
  return `<article class="product-card${p.stock <= 0 ? ' is-out' : ''}">
  <a class="card-media" href="/product/${p.slug}">
    <img src="/images/${p.images[0]}" alt="${esc(p.name)}"${sizeAttrs(p.images[0])} loading="lazy">
  </a>
  <div class="card-body">
    <h3><a href="/product/${p.slug}">${esc(p.shortName)}</a></h3>
    <p class="card-price">${sale}<strong>${money(p.price)}</strong></p>
    ${stockLabel(p.stock)}
  </div>
  <a class="btn btn-sm card-btn" href="/product/${p.slug}">More info</a>
</article>`;
}

function productGrid(products, extraClass = '') {
  if (!products.length) {
    return `<p class="empty">Nothing in this category right now — <a href="/contact">ask us what's coming in</a>.</p>`;
  }
  return `<div class="product-grid ${extraClass}">${products.map(productCard).join('')}</div>`;
}

/** Big split content block: text one side, image on a blue blob the other. */
function splitBlock({ eyebrow, title, body, image, alt, cta, reverse = false, blob = true }) {
  return `<section class="split${reverse ? ' split-reverse' : ''}">
  <div class="wrap split-inner">
    <div class="split-text">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h2>${esc(title)}</h2>
      ${body}
      ${cta ? `<a class="btn" href="${cta.href}">${esc(cta.label)}</a>` : ''}
    </div>
    <div class="split-media${blob ? ' has-blob' : ''}">
      <img src="/images/${image}" alt="${esc(alt)}"${sizeAttrs(image)} loading="lazy">
    </div>
  </div>
</section>`;
}

/** The "contact us on" row of pill buttons used on several pages. */
function contactPills() {
  const site = require('./site');
  return `<div class="pill-row">
  <a class="pill" href="tel:${site.phoneIntl}">${icons.phone}<span>Phone</span></a>
  <a class="pill" href="mailto:${site.email}">${icons.mail}<span>Email</span></a>
  <a class="pill" href="${site.social.instagram}" target="_blank" rel="noopener">${icons.instagram}<span>Instagram</span></a>
  <a class="pill" href="${site.social.messenger}" target="_blank" rel="noopener">${icons.messenger}<span>Messenger</span></a>
</div>`;
}

/** A labelled field. `type` of `textarea` / `select` switch the control. */
function field({ name, label, type = 'text', required = false, options, placeholder, rows = 5, value = '', help, autocomplete }) {
  const id = `f-${name}`;
  const req = required ? ' required' : '';
  const ac = autocomplete ? ` autocomplete="${autocomplete}"` : '';
  let control;
  if (type === 'textarea') {
    control = `<textarea id="${id}" name="${name}" rows="${rows}" placeholder="${esc(placeholder || '')}"${req}>${esc(value)}</textarea>`;
  } else if (type === 'select') {
    const opts = (options || [])
      .map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const text = typeof o === 'string' ? o : o.label;
        return `<option value="${esc(val)}"${val === value ? ' selected' : ''}>${esc(text)}</option>`;
      })
      .join('');
    control = `<select id="${id}" name="${name}"${req}><option value="">Please choose…</option>${opts}</select>`;
  } else {
    control = `<input id="${id}" name="${name}" type="${type}" placeholder="${esc(placeholder || '')}" value="${esc(value)}"${req}${ac}>`;
  }
  return `<div class="field">
  <label for="${id}">${esc(label)}${required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
  ${control}
  ${help ? `<p class="field-help">${esc(help)}</p>` : ''}
</div>`;
}

/** Checkbox / radio group. */
function choiceGroup({ name, legend, options, type = 'checkbox', help }) {
  const items = options
    .map((o, i) => {
      const val = typeof o === 'string' ? o : o.value;
      const text = typeof o === 'string' ? o : o.label;
      return `<label class="choice"><input type="${type}" name="${name}" value="${esc(val)}" id="c-${name}-${i}"><span>${esc(text)}</span></label>`;
    })
    .join('');
  return `<fieldset class="field choice-field">
  <legend>${esc(legend)}</legend>
  ${help ? `<p class="field-help">${esc(help)}</p>` : ''}
  <div class="choice-row">${items}</div>
</fieldset>`;
}

/**
 * Honeypot + status region shared by both forms. The hidden `company` input
 * catches the bots that fill in every field they find.
 */
function formFurniture() {
  return `<div class="hp" aria-hidden="true">
  <label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label>
</div>
<div class="form-status" role="status" aria-live="polite" hidden></div>`;
}

module.exports = {
  productCard,
  productGrid,
  splitBlock,
  contactPills,
  field,
  choiceGroup,
  formFurniture,
  stockLabel,
};
