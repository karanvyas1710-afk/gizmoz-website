# Gizmoz — website

The Gizmoz storefront: laptops and accessories, BYOD and Wi-Fi solutions, the
device questionnaire and the contact form. Built from the `Gizmoz website
Updated.xd` design and the `Website Content.docx` outline.

It is a small Express app that renders HTML on the server. No build step, no
framework, two dependencies (`express` and `nodemailer`).

## Running it locally

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # same, restarts on file changes
```

## Deploying to Render

The repository contains `render.yaml`, so Render can set the service up for you:

1. In Render, choose **New → Blueprint** and point it at this repository.
   Render reads `render.yaml` and creates a web service with `npm install` as
   the build command and `npm start` as the start command.
2. Add the email variables below under **Environment** (see *Where form
   submissions go*).
3. Deploy. Render sets `PORT` itself; the app reads it.

To set the service up by hand instead: Web Service → Node, build `npm install`,
start `npm start`.

`/healthz` returns `{"ok":true,"mail":<bool>}` and is wired up as the health
check, so you can see at a glance whether email is configured on the running
instance.

## Where form submissions go

Three forms post to the server: the contact form, the device questionnaire and
the basket's order request.

**Until you set the SMTP variables, nothing is emailed.** Submissions are
written to `submissions/` and printed to the Render logs instead, so a
customer enquiry is never silently dropped — but note Render's disk is
ephemeral, so treat those files as a log, not as storage. Set these to turn
email on:

| Variable    | Example                    | Notes                                     |
| ----------- | -------------------------- | ----------------------------------------- |
| `SMTP_HOST` | `smtp.mail.yahoo.com`      | Your mail provider's SMTP server           |
| `SMTP_PORT` | `465`                      | 465 for SSL, 587 for STARTTLS              |
| `SMTP_USER` | `gizmozau@yahoo.com`       | The mailbox that sends                     |
| `SMTP_PASS` | *app password*             | An app password, **not** your login password |
| `MAIL_TO`   | `gizmozau@yahoo.com`       | Where enquiries land (defaults to the address in `lib/site.js`) |
| `MAIL_FROM` | `Gizmoz <gizmozau@yahoo.com>` | Optional `From:` override              |

Set these in the Render dashboard. Never commit them.

Each form also carries a hidden honeypot field and a per-IP rate limit (8
submissions per 10 minutes) to keep the mailbox clean.

## Editing the site

Almost everything the owners will want to change lives in two files.

**`lib/site.js`** — phone, email, address, ABN, social links, the nav tree, the
contact form's enquiry types, and the home-page promo banner. To retire the
Back to School offer, set `promo.active` to `false`; nothing else needs
touching.

**`data/products.json`** — the catalogue. One entry per product:

```jsonc
{
  "slug": "thinkpad-l13-gen-2",    // the URL: /product/thinkpad-l13-gen-2
  "name": "Lenovo ThinkPad L13 Generation 2",
  "shortName": "ThinkPad L13 Gen 2", // used on cards, where space is tight
  "brand": "lenovo",                 // lenovo | hp | dell — drives /shop/<brand>
  "category": "laptops",             // laptops | accessories
  "price": 999,
  "wasPrice": 1299,                  // null when it isn't on sale
  "stock": 4,                        // 0 disables "Buy now" and shows Out of stock
  "featured": true,                  // shows in "Top picks" on the home page
  "tagline": "…",                    // one line, under the title
  "description": "…",                // blank lines become paragraphs
  "images": ["products/l13-gen2-1.png"],  // first one is the card/gallery image
  "specs": [["Colour", "Black"]]     // label / value pairs for the spec table
}
```

Product images go in `public/images/products/`. The server reads each image's
real dimensions at startup and writes them onto the `<img>` tag, so pages don't
jump around while images load — you don't need to record sizes anywhere.

Changes to `products.json` are read at startup, so restart (or redeploy) to
pick them up.

## Pages

| Route                              | What it is                                            |
| ---------------------------------- | ----------------------------------------------------- |
| `/`                                | Home — promo, intro, top picks, BYOD, Wi-Fi, socials, contact |
| `/shop`                            | Whole store                                           |
| `/shop/laptops`, `/shop/accessories` | Category views                                      |
| `/shop/lenovo`, `/shop/hp`, `/shop/dell` | Brand views, each with "can't find it?"         |
| `/product/:slug`                   | Item page — gallery, specs, shipping, returns         |
| `/cart`                            | Basket and order request                              |
| `/our-story`                       | About Gizmoz, origin story, approach, the birth of Gizmoz |
| `/personal-solutions`              | BYOD, work devices and Wi-Fi in one place             |
| `/byod`                            | Devices for school                                    |
| `/wifi-solutions`                  | Wi-Fi and networking                                  |
| `/find-your-ideal-device`          | Book an appointment, or take the questionnaire        |
| `/questionnaire`                   | The questionnaire itself                              |
| `/contact`                         | Contact form, details, map and returns policy         |
| `/healthz`                         | Health check                                          |

## How the basket works

The basket is **not** a checkout. Items are kept in the visitor's browser
(`localStorage`); submitting the form emails Gizmoz an order request and the
customer is told you'll confirm stock and reply with a total and payment
options. No card details are collected and no payment is taken.

Prices in that email are always looked up from `products.json` on the server,
never taken from what the browser posted, so a tampered basket can't change
what a product costs.

Every form works with JavaScript switched off — it posts normally and lands on
a thank-you page. JavaScript just upgrades it to submit in place.

## Layout

```
server.js            routes, form handling, validation, rate limiting
  render.yaml          Render blueprint
  data/products.json   the catalogue
  lib/
    site.js            contact details, links, nav, promo  ← edit me
    layout.js          page shell, header, footer, banner
    components.js      product cards, split blocks, form fields
    brand.js           logo and icons, as inline SVG
    imagesize.js       reads intrinsic image dimensions
    mailer.js          SMTP delivery, with the save-to-disk fallback
  pages/               one module per page
  public/
    css/site.css       all styles; design tokens at the top
    js/site.js         mobile nav, gallery, basket, form submission
    images/            site imagery and product photography
```

## Notes on the design

Colours, spacing and type come from the XD file and are declared as custom
properties at the top of `public/css/site.css` (`--blue: #1363df`,
`--navy: #06283d`, and so on). The logo is rebuilt as inline SVG from the
vector geometry in the XD document, so it stays sharp at any size and is
recoloured with CSS rather than shipped as several PNGs.

Two things in the design are placeholders you may want to revisit:

- **The Instagram block** on the home page links to the profile rather than
  embedding a specific post. To embed a real post, drop Instagram's
  `embed.js` and the post's permalink into the `.ig-embed` block in
  `pages/home.js`.
- **HP and Dell** have shop pages but no stock, so they show the "can't find
  what you're looking for?" panel. Add entries to `products.json` with
  `"brand": "hp"` or `"dell"` and they'll populate automatically.
