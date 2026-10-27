'use strict';

const crypto = require('crypto');
const multer = require('multer');

const store = require('./store');
const auth = require('./auth');
const admin = require('../pages/admin');

/**
 * The stock-management area.
 *
 * Mounted at ADMIN_PATH (default /manage). If ADMIN_PASSWORD is unset the
 * whole area is never registered, so those URLs fall through to the site's
 * own 404 — a misconfigured deploy is closed rather than open.
 */

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

/**
 * Read one submitted field as a string. A repeated field name arrives as an
 * array; take the last value rather than letting String() join it with commas.
 */
function str(v, max = 4000) {
  const one = Array.isArray(v) ? v[v.length - 1] : v;
  return String(one == null ? '' : one).trim().slice(0, max);
}

/** Whole dollars, or null when blank. Rejects negatives and nonsense. */
function toMoney(value, { required = false } = {}) {
  const raw = str(value, 20);
  if (!raw) return required ? NaN : null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1000000) return NaN;
  return Math.round(n);
}

function toCount(value) {
  const n = Number(str(value, 10));
  if (!Number.isFinite(n) || n < 0 || n > 100000) return NaN;
  return Math.round(n);
}

/** "Label: value" lines become [label, value] pairs. */
function parseSpecs(text) {
  return str(text, 20000)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return [line, ''];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
    .filter(([label]) => label);
}

function slugify(name) {
  return str(name, 120)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Build a product from submitted fields. Returns { product } or { error }.
 * `existing` supplies the values the form does not carry (images, slug).
 */
function buildProduct(body, existing) {
  const name = str(body.name, 160);
  if (!name) return { error: 'Please give the product a name.' };

  const price = toMoney(body.price, { required: true });
  if (Number.isNaN(price) || price === null) return { error: 'Price must be a whole number of dollars.' };

  const wasPrice = toMoney(body.wasPrice);
  if (Number.isNaN(wasPrice)) return { error: 'The "was" price must be a whole number of dollars, or blank.' };
  if (wasPrice !== null && wasPrice <= price) {
    return { error: 'The "was" price should be higher than the current price, or left blank.' };
  }

  const stock = toCount(body.stock);
  if (Number.isNaN(stock)) return { error: 'Stock must be a whole number, zero or more.' };

  const brand = ['lenovo', 'hp', 'dell'].includes(body.brand) ? body.brand : 'lenovo';
  const category = ['laptops', 'accessories'].includes(body.category) ? body.category : 'laptops';

  return {
    product: {
      slug: existing ? existing.slug : slugify(name),
      name,
      shortName: str(body.shortName, 80) || name,
      model: str(body.model, 80),
      brand,
      category,
      price,
      wasPrice,
      stock,
      featured: body.featured === 'yes',
      tagline: str(body.tagline, 200),
      description: str(body.description, 8000),
      images: existing ? existing.images || [] : [],
      specs: parseSpecs(body.specs),
    },
  };
}

/**
 * True for a photo the owner uploaded, which is therefore ours to delete.
 * On a disk those are "/uploads/…"; on Blob they are full CDN URLs. Images
 * that shipped with the repo are relative and are left alone.
 */
function isUpload(ref) {
  return Boolean(ref) && (ref.startsWith('/uploads/') || /^https?:\/\//i.test(ref));
}

/** "stock" / "/stock/" / "" all become "/stock", and empty falls back. */
function normalisePath(value) {
  const raw = String(value == null ? '' : value).trim().replace(/\/+$/, '');
  if (!raw) return '/manage';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

module.exports = function adminRoutes(app) {
  if (!auth.isEnabled()) {
    console.log('[gizmoz] ADMIN_PASSWORD is not set — the stock manager is disabled.');
    return;
  }

  // Normalise ADMIN_PATH: a value without a leading slash registers a route
  // that can never match, which looks exactly like the area not existing.
  const base = normalisePath(process.env.ADMIN_PATH);
  const html = (res, markup) => res.type('html').send(markup);
  const redirect = (res, to, msg) =>
    res.redirect(303, msg ? `${to}${to.includes('?') ? '&' : '?'}m=${encodeURIComponent(msg)}` : to);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  });

  /** Everything below the login form requires a valid session. */
  function requireLogin(req, res, next) {
    if (auth.isLoggedIn(req)) return next();
    return res.redirect(303, `${base}/login`);
  }

  /**
   * Re-read the catalogue before rendering the admin area.
   *
   * The public site is happy with a snapshot that is a few seconds old. The
   * owner is not: they need to see the edit they just made, not whichever
   * copy this instance happens to be holding.
   */
  function fresh(req, res, next) {
    store.ready({ force: true }).then(() => next(), next);
  }

  /** Turn a rejected promise into an error the Express handler can report. */
  const guard = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  /* -- login / logout ---------------------------------------------- */

  app.get(`${base}/login`, (req, res) => {
    if (auth.isLoggedIn(req)) return res.redirect(303, base);
    html(res, admin.login({ base, error: req.query.e ? 'Incorrect password.' : null }));
  });

  app.post(`${base}/login`, (req, res) => {
    if (!auth.checkPassword(req.body && req.body.password)) {
      return res.redirect(303, `${base}/login?e=1`);
    }
    auth.issue(res, req);
    res.redirect(303, base);
  });

  app.post(`${base}/logout`, (_req, res) => {
    auth.clear(res);
    res.redirect(303, `${base}/login`);
  });

  /* -- list --------------------------------------------------------- */

  app.get(base, requireLogin, fresh, (req, res) => {
    html(res, admin.list({ base, notice: str(req.query.m, 200) || null }));
  });

  /* -- create ------------------------------------------------------- */

  app.get(`${base}/new`, requireLogin, (req, res) => {
    html(res, admin.form({ base, product: null, isNew: true }));
  });

  app.post(`${base}/create`, requireLogin, fresh, guard(async (req, res) => {
    const { product, error } = buildProduct(req.body, null);
    if (error) return html(res, admin.form({ base, product: req.body, isNew: true, error }));

    if (!product.slug) {
      return html(res, admin.form({ base, product: req.body, isNew: true, error: 'That name cannot be turned into a web address. Please use some letters or numbers.' }));
    }
    if (store.bySlug(product.slug)) {
      return html(res, admin.form({ base, product: req.body, isNew: true, error: 'A product with a very similar name already exists.' }));
    }

    await store.upsert(product);
    redirect(res, `${base}/edit/${product.slug}`, 'Product created. Add some photos next.');
  }));

  /* -- edit --------------------------------------------------------- */

  app.get(`${base}/edit/:slug`, requireLogin, fresh, (req, res, next) => {
    const product = store.bySlug(req.params.slug);
    if (!product) return next();
    html(res, admin.form({ base, product, isNew: false, notice: str(req.query.m, 200) || null }));
  });

  app.post(`${base}/edit/:slug`, requireLogin, fresh, guard(async (req, res, next) => {
    const existing = store.bySlug(req.params.slug);
    if (!existing) return next();

    const { product, error } = buildProduct(req.body, existing);
    if (error) {
      return html(res, admin.form({ base, product: { ...existing, ...req.body }, isNew: false, error }));
    }
    await store.upsert(product);
    redirect(res, `${base}/edit/${product.slug}`, 'Saved.');
  }));

  /* -- delete ------------------------------------------------------- */

  app.post(`${base}/delete/:slug`, requireLogin, fresh, guard(async (req, res, next) => {
    const product = store.bySlug(req.params.slug);
    if (!product) return next();

    const owned = (product.images || []).filter(isUpload);
    await store.remove(product.slug);

    // Take its uploaded photos with it, unless another product shares one.
    await Promise.all(
      owned
        .filter((ref) => !store.all().some((p) => (p.images || []).includes(ref)))
        .map((ref) =>
          store.deleteImage(ref).catch((err) =>
            console.error('[gizmoz] could not delete photo:', err.message)
          )
        )
    );

    redirect(res, base, `Deleted ${product.name}.`);
  }));

  /* -- photos ------------------------------------------------------- */

  app.post(`${base}/image/:slug/upload`, requireLogin, fresh, (req, res, next) => {
    const product = store.bySlug(req.params.slug);
    if (!product) return next();

    upload.single('photo')(req, res, async (err) => {
      if (err) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'That photo is larger than 5 MB. Please use a smaller one.'
            : 'That upload could not be read. Please try again.';
        return html(res, admin.form({ base, product, isNew: false, error: msg }));
      }
      if (!req.file) {
        return html(res, admin.form({ base, product, isNew: false, error: 'Please choose a photo to upload.' }));
      }

      const ext = ALLOWED_TYPES.get(req.file.mimetype);
      if (!ext) {
        return html(res, admin.form({ base, product, isNew: false, error: 'Photos must be JPEG, PNG or WebP.' }));
      }

      // Random filename: never trust the browser-supplied one for a disk path.
      const filename = `${product.slug}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      let ref;
      try {
        ref = await store.putImage(filename, req.file.buffer, req.file.mimetype);
      } catch (writeErr) {
        console.error('[gizmoz] upload failed:', writeErr.message);
        return html(res, admin.form({ base, product, isNew: false, error: 'The photo could not be saved. Please try again.' }));
      }

      try {
        await store.upsert({ ...product, images: [...(product.images || []), ref] });
      } catch (saveErr) {
        return next(saveErr);
      }
      redirect(res, `${base}/edit/${product.slug}`, 'Photo added.');
    });
  });

  app.post(`${base}/image/:slug/delete`, requireLogin, fresh, guard(async (req, res, next) => {
    const product = store.bySlug(req.params.slug);
    if (!product) return next();

    const index = Number(req.body && req.body.index);
    const images = product.images || [];
    if (!Number.isInteger(index) || index < 0 || index >= images.length) {
      return redirect(res, `${base}/edit/${product.slug}`, 'That photo no longer exists.');
    }

    const [removed] = images.slice(index, index + 1);
    await store.upsert({ ...product, images: images.filter((_, i) => i !== index) });

    // Only uploads are ours to delete; images shipped with the site stay put
    // in case another product still references them.
    if (isUpload(removed) && !store.all().some((p) => (p.images || []).includes(removed))) {
      await store.deleteImage(removed).catch((err) =>
        console.error('[gizmoz] could not delete photo:', err.message)
      );
    }

    redirect(res, `${base}/edit/${product.slug}`, 'Photo removed.');
  }));

  app.post(`${base}/image/:slug/primary`, requireLogin, fresh, guard(async (req, res, next) => {
    const product = store.bySlug(req.params.slug);
    if (!product) return next();

    const index = Number(req.body && req.body.index);
    const images = product.images || [];
    if (!Number.isInteger(index) || index <= 0 || index >= images.length) {
      return redirect(res, `${base}/edit/${product.slug}`, 'That photo could not be moved.');
    }

    const next_ = [images[index], ...images.filter((_, i) => i !== index)];
    await store.upsert({ ...product, images: next_ });
    redirect(res, `${base}/edit/${product.slug}`, 'Main photo updated.');
  }));

  console.log(`[gizmoz] stock manager available at ${base}`);
  return base;
};
