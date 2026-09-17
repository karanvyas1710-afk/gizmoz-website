'use strict';

const store = require('../lib/store');

/** Escape for HTML body and attribute contexts. */
function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-AU');
}

/**
 * The admin shell. Deliberately plain: system fonts, a white page, one link
 * colour. It should feel like a tool, not like the shop.
 */
function shell({ title, body, base, showNav = true, notice }) {
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} — Gizmoz admin</title>
<link rel="icon" href="/favicon.png" type="image/png" sizes="512x512">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body>
<header class="bar">
  <strong>Gizmoz stock</strong>
  ${showNav ? `<nav>
    <a href="${base}">All products</a>
    <a href="${base}/new">Add product</a>
    <a href="/" target="_blank" rel="noopener">View shop</a>
    <form method="post" action="${base}/logout"><button type="submit" class="link">Log out</button></form>
  </nav>` : ''}
</header>
<main>
${!store.isDurable() && showNav ? `<p class="warn"><strong>Changes will not survive a restart.</strong>
  This server has no persistent disk attached, so anything saved here is lost when the service
  restarts or redeploys. Ask your developer to attach a Render disk and set <code>DATA_DIR</code>.</p>` : ''}
${notice ? `<p class="notice">${esc(notice)}</p>` : ''}
${body}
</main>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function login({ base, error }) {
  const body = `
<h1>Sign in</h1>
${error ? `<p class="error">${esc(error)}</p>` : ''}
<form method="post" action="${base}/login" class="narrow">
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
  <button type="submit">Sign in</button>
</form>`;
  return shell({ title: 'Sign in', body, base, showNav: false });
}

/* ------------------------------------------------------------------ */
/* Product list                                                        */
/* ------------------------------------------------------------------ */

function list({ base, notice }) {
  const products = store.all();

  const rows = products
    .map(
      (p) => `<tr>
  <td class="thumb">${
    p.images && p.images[0]
      ? `<img src="${esc(store.imageUrl(p.images[0]))}" alt="">`
      : '<span class="no-img">none</span>'
  }</td>
  <td>
    <a href="${base}/edit/${esc(p.slug)}"><strong>${esc(p.name)}</strong></a>
    <span class="sub">${esc(p.model || 'no model number')}</span>
  </td>
  <td class="num">${money(p.price)}${p.wasPrice ? `<span class="sub was">was ${money(p.wasPrice)}</span>` : ''}</td>
  <td class="num ${p.stock <= 0 ? 'zero' : ''}">${Number(p.stock) || 0}</td>
  <td class="cat">${esc(p.category)}</td>
  <td class="view"><a href="/product/${esc(p.slug)}" target="_blank" rel="noopener">view</a></td>
</tr>`
    )
    .join('');

  const body = `
<h1>Products</h1>
<p class="sub-line">${products.length} product${products.length === 1 ? '' : 's'}. Click a name to edit its price, stock, model number or photos.</p>
<div class="table-wrap">
  <table>
    <thead>
      <tr><th class="thumb">Photo</th><th>Product</th><th class="num">Price</th><th class="num">Stock</th><th class="cat">Category</th><th class="view"></th></tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="6">No products yet.</td></tr>'}</tbody>
  </table>
</div>
<p><a class="button" href="${base}/new">Add a product</a></p>`;

  return shell({ title: 'Products', body, base, notice });
}

/* ------------------------------------------------------------------ */
/* Product form (add + edit)                                           */
/* ------------------------------------------------------------------ */

function form({ base, product, isNew, error, notice }) {
  const p = product || {};
  const images = p.images || [];
  const specs = (p.specs || []).map(([k, v]) => `${k}: ${v}`).join('\n');

  const imageList = images.length
    ? `<ul class="images">${images
        .map(
          (img, i) => `<li>
      <img src="${esc(store.imageUrl(img))}" alt="">
      <div>
        <span class="sub">${i === 0 ? 'Main photo' : `Photo ${i + 1}`}</span>
        <div class="img-actions">
          ${i > 0 ? `<button type="submit" form="img-${i}-up" class="link">Make main</button>` : ''}
          <button type="submit" form="img-${i}-del" class="link danger">Remove</button>
        </div>
      </div>
    </li>`
        )
        .join('')}</ul>`
    : '<p class="sub-line">No photos yet.</p>';

  // Image actions are separate small forms so they cannot submit the main one.
  const imageForms = images
    .map(
      (img, i) => `
<form id="img-${i}-up" method="post" action="${base}/image/${esc(p.slug)}/primary" class="hidden-form">
  <input type="hidden" name="index" value="${i}">
</form>
<form id="img-${i}-del" method="post" action="${base}/image/${esc(p.slug)}/delete" class="hidden-form">
  <input type="hidden" name="index" value="${i}">
</form>`
    )
    .join('');

  const body = `
<h1>${isNew ? 'Add a product' : esc(p.name)}</h1>
${error ? `<p class="error">${esc(error)}</p>` : ''}

<form method="post" action="${base}/${isNew ? 'create' : `edit/${esc(p.slug)}`}">
  <fieldset>
    <legend>Details</legend>

    <label for="name">Product name</label>
    <input id="name" name="name" value="${esc(p.name || '')}" required>

    <label for="model">Model number</label>
    <input id="model" name="model" value="${esc(p.model || '')}" placeholder="e.g. 20VH0016AU">

    <label for="shortName">Short name <span class="hint">shown on cards, where space is tight</span></label>
    <input id="shortName" name="shortName" value="${esc(p.shortName || '')}">

    <div class="row">
      <div>
        <label for="price">Price (AUD)</label>
        <input id="price" name="price" type="number" min="0" step="1" value="${esc(p.price ?? '')}" required>
      </div>
      <div>
        <label for="wasPrice">Was price <span class="hint">leave blank if not on sale</span></label>
        <input id="wasPrice" name="wasPrice" type="number" min="0" step="1" value="${esc(p.wasPrice ?? '')}">
      </div>
      <div>
        <label for="stock">Stock on hand</label>
        <input id="stock" name="stock" type="number" min="0" step="1" value="${esc(p.stock ?? 0)}" required>
      </div>
    </div>

    <div class="row">
      <div>
        <label for="brand">Brand</label>
        <select id="brand" name="brand">
          ${['lenovo', 'hp', 'dell']
            .map((b) => `<option value="${b}"${p.brand === b ? ' selected' : ''}>${b.toUpperCase()}</option>`)
            .join('')}
        </select>
      </div>
      <div>
        <label for="category">Category</label>
        <select id="category" name="category">
          ${['laptops', 'accessories']
            .map((c) => `<option value="${c}"${p.category === c ? ' selected' : ''}>${c}</option>`)
            .join('')}
        </select>
      </div>
      <div>
        <label for="featured">Show on home page</label>
        <select id="featured" name="featured">
          <option value="no"${!p.featured ? ' selected' : ''}>No</option>
          <option value="yes"${p.featured ? ' selected' : ''}>Yes</option>
        </select>
      </div>
    </div>

    <label for="tagline">One-line summary</label>
    <input id="tagline" name="tagline" value="${esc(p.tagline || '')}">

    <label for="description">Description <span class="hint">leave a blank line between paragraphs</span></label>
    <textarea id="description" name="description" rows="7">${esc(p.description || '')}</textarea>

    <label for="specs">Specifications <span class="hint">one per line, as <code>Label: value</code></span></label>
    <textarea id="specs" name="specs" rows="12" spellcheck="false">${esc(specs)}</textarea>
  </fieldset>

  <div class="actions">
    <button type="submit">${isNew ? 'Create product' : 'Save changes'}</button>
    <a class="link" href="${base}">Cancel</a>
  </div>
</form>

${
  isNew
    ? '<p class="sub-line">You can add photos once the product is created.</p>'
    : `
<h2>Photos</h2>
<p class="sub-line">The first photo is used on the shop grid. JPEG or PNG, up to 5&nbsp;MB each.</p>
${imageList}

<form method="post" action="${base}/image/${esc(p.slug)}/upload" enctype="multipart/form-data" class="upload">
  <label for="photo">Add a photo</label>
  <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp" required>
  <button type="submit">Upload</button>
</form>
${imageForms}

<h2>Delete</h2>
<form method="post" action="${base}/delete/${esc(p.slug)}" onsubmit="return confirm('Delete ${esc(
        p.name
      )}? This cannot be undone.')">
  <button type="submit" class="danger-btn">Delete this product</button>
</form>`
}`;

  return shell({ title: isNew ? 'Add product' : p.name || 'Edit', body, base, notice });
}

module.exports = { login, list, form, shell, esc };
