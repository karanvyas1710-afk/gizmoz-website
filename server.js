'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

const site = require('./lib/site');
const mailer = require('./lib/mailer');
const store = require('./lib/store');
const adminRoutes = require('./lib/admin-routes');
const { money } = require('./lib/layout');

const home = require('./pages/home');
const shop = require('./pages/shop');
const productPage = require('./pages/product');
const { ourStory, personalSolutions, byod, wifiSolutions } = require('./pages/content');
const { contact, findYourIdealDevice, questionnaire, cart, thanks, notFound } = require('./pages/forms');

// The catalogue is mutable at runtime — the admin area edits it — so every
// route reads it through the store rather than closing over a snapshot.
store.load();
const products = () => store.all();
const bySlug = (slug) => store.bySlug(slug);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(express.json({ limit: '64kb' }));

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    extensions: ['html'],
  })
);

// Photos uploaded through the admin area live outside the code directory.
app.use(
  '/uploads',
  express.static(store.UPLOADS_DIR, {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    index: false,
    dotfiles: 'deny',
  })
);

// The admin area mounts itself, and is absent entirely when no password is set.
adminRoutes(app);

const html = (res, markup) => res.type('html').send(markup);

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

app.get('/healthz', (_req, res) => res.json({ ok: true, mail: mailer.isMailConfigured() }));

app.get('/', (_req, res) => html(res, home(products())));
app.get('/our-story', (_req, res) => html(res, ourStory()));
app.get('/personal-solutions', (_req, res) => html(res, personalSolutions()));
app.get('/byod', (_req, res) => html(res, byod()));
app.get('/wifi-solutions', (_req, res) => html(res, wifiSolutions()));
app.get('/find-your-ideal-device', (_req, res) => html(res, findYourIdealDevice()));
app.get('/questionnaire', (_req, res) => html(res, questionnaire()));
app.get('/contact', (req, res) => html(res, contact(req.query)));
app.get('/cart', (_req, res) => html(res, cart()));

app.get('/shop', (_req, res) => html(res, shop(products())));

const BRANDS = new Set(['lenovo', 'hp', 'dell']);
const CATEGORIES = new Set(['laptops', 'accessories']);

app.get('/shop/:segment', (req, res, next) => {
  const seg = String(req.params.segment).toLowerCase();
  if (BRANDS.has(seg)) return html(res, shop(products(), { brand: seg }));
  if (CATEGORIES.has(seg)) return html(res, shop(products(), { category: seg }));
  return next();
});

app.get('/product/:slug', (req, res, next) => {
  const p = bySlug(req.params.slug);
  if (!p) return next();
  return html(res, productPage(p, products()));
});

app.get('/thanks/:kind', (req, res) => html(res, thanks(req.params.kind)));

/* A few friendly aliases for links people may already have. */
const ALIASES = {
  '/about': '/our-story',
  '/shop/byod': '/byod',
  '/wifi': '/wifi-solutions',
  '/find-your-device': '/find-your-ideal-device',
  '/questionnaire1': '/questionnaire',
};
Object.entries(ALIASES).forEach(([from, to]) => app.get(from, (_req, res) => res.redirect(301, to)));

/* ------------------------------------------------------------------ */
/* Form handling                                                       */
/* ------------------------------------------------------------------ */

/** Simple per-IP rate limit so the mailbox can't be flooded. */
const hits = new Map();
function rateLimited(req, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

const str = (v, max = 2000) => String(v == null ? '' : v).trim().slice(0, max);
const list = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map((x) => str(x, 120));
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Shared submit handler: validates, delivers, then answers JSON for the
 * fetch-based path or redirects for the no-JavaScript path.
 */
function handleSubmit({ kind, validate, build, subject }) {
  return async (req, res) => {
    const wantsJson = req.get('accept')?.includes('application/json') || req.xhr;
    const fail = (status, message) =>
      wantsJson ? res.status(status).json({ ok: false, message }) : res.status(status).send(message);

    // Honeypot: real people never see this input, bots fill it in.
    if (str(req.body.company)) return wantsJson ? res.json({ ok: true }) : res.redirect(303, `/thanks/${kind}`);

    if (rateLimited(req)) {
      return fail(429, `Too many messages from this connection. Please call us on ${site.phone}.`);
    }

    const error = validate(req.body);
    if (error) return fail(400, error);

    try {
      const { fields, replyTo, heading } = build(req.body);
      const result = await mailer.send({ kind, subject: subject(req.body), heading, fields, replyTo });
      if (wantsJson) return res.json({ ok: true, delivered: result.delivered });
      return res.redirect(303, `/thanks/${kind}`);
    } catch (err) {
      console.error(`[gizmoz] ${kind} delivery failed:`, err.message);
      return fail(
        502,
        `We couldn't send that just now. Please email ${site.email} or call ${site.phone} and we'll sort it out.`
      );
    }
  };
}

app.post(
  '/api/contact',
  handleSubmit({
    kind: 'contact',
    validate: (b) => {
      if (!str(b.name)) return 'Please tell us your name.';
      if (!looksLikeEmail(str(b.email))) return 'Please enter a valid email address.';
      if (!str(b.message)) return 'Please write a message.';
      return null;
    },
    subject: (b) => `Website enquiry — ${str(b.subject, 80) || 'General query'}`,
    build: (b) => ({
      heading: 'New enquiry from the Gizmoz website',
      replyTo: str(b.email, 200),
      fields: [
        ['Name', str(b.name, 120)],
        ['Email', str(b.email, 200)],
        ['Phone', str(b.phone, 40)],
        ['Enquiry type', str(b.subject, 80)],
        ['Message', str(b.message, 4000)],
      ],
    }),
  })
);

app.post(
  '/api/questionnaire',
  handleSubmit({
    kind: 'questionnaire',
    validate: (b) => {
      if (!str(b.name)) return 'Please tell us your name.';
      if (!looksLikeEmail(str(b.email))) return 'Please enter a valid email address.';
      if (!str(b.purpose)) return 'Please tell us what the device is for.';
      if (!str(b.budget)) return 'Please pick a budget range.';
      return null;
    },
    subject: (b) => `Device questionnaire — ${str(b.name, 60)} (${str(b.purpose, 40)})`,
    build: (b) => ({
      heading: 'Device questionnaire submitted',
      replyTo: str(b.email, 200),
      fields: [
        ['Name', str(b.name, 120)],
        ['Email', str(b.email, 200)],
        ['Phone', str(b.phone, 40)],
        ['Best contact method', str(b.contactPreference, 40)],
        ['Purpose', str(b.purpose, 60)],
        ['Purpose detail', str(b.purposeDetail, 1000)],
        ['Budget', str(b.budget, 60)],
        ['Preferred brands', list(b.brands)],
        ['Features wanted', list(b.features)],
        ['RAM', str(b.ram, 40)],
        ['Storage', str(b.ssd, 40)],
        ['Processor', str(b.processor, 60)],
        ['Battery life', str(b.battery, 60)],
        ['Other notes', str(b.notes, 2000)],
      ],
    }),
  })
);

app.post(
  '/api/order',
  handleSubmit({
    kind: 'order',
    validate: (b) => {
      if (!str(b.name)) return 'Please tell us your name.';
      if (!looksLikeEmail(str(b.email))) return 'Please enter a valid email address.';
      let items;
      try {
        items = JSON.parse(str(b.items, 8000) || '[]');
      } catch {
        return 'We could not read your basket. Please try again.';
      }
      if (!Array.isArray(items) || !items.length) return 'Your basket is empty.';
      return null;
    },
    subject: (b) => `Order request — ${str(b.name, 60)}`,
    build: (b) => {
      // Price from our own catalogue, never from what the browser posted.
      const raw = JSON.parse(str(b.items, 8000) || '[]');
      let total = 0;
      const lines = raw
        .map((item) => {
          const p = bySlug(String(item.slug));
          if (!p) return null;
          const qty = Math.max(1, Math.min(20, parseInt(item.qty, 10) || 1));
          total += p.price * qty;
          return `${qty} × ${p.name} — ${money(p.price * qty)}`;
        })
        .filter(Boolean);
      return {
        heading: 'Order request from the Gizmoz website',
        replyTo: str(b.email, 200),
        fields: [
          ['Name', str(b.name, 120)],
          ['Email', str(b.email, 200)],
          ['Phone', str(b.phone, 40)],
          ['Fulfilment', str(b.fulfilment, 60)],
          ['Items', lines],
          ['Estimated total', money(total)],
          ['Notes', str(b.notes, 2000)],
        ],
      };
    },
  })
);

/* ------------------------------------------------------------------ */

app.use((_req, res) => res.status(404).type('html').send(notFound()));

app.use((err, _req, res, _next) => {
  console.error('[gizmoz] unhandled error:', err);
  res.status(500).type('html').send(notFound());
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[gizmoz] listening on http://localhost:${port}`);
  if (!mailer.isMailConfigured()) {
    console.log('[gizmoz] SMTP not configured — form submissions will be saved to ./submissions and logged.');
  }
});
