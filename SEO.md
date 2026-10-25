# SEO — what's built, and what you still need to do

This covers search on Google and the newer kind: someone asking Claude,
ChatGPT, Gemini or Perplexity "where can I buy a ThinkPad in Sydney". The
two want mostly the same things, so almost everything here serves both.

---

## 1. Set `SITE_URL` — do this first

Every canonical tag, sitemap entry and structured-data URL is built from
one environment variable. **If it is wrong, Google is told the real site
lives somewhere else and will index that instead.**

In cPanel → Setup Node.js App → Environment variables:

```
SITE_URL = https://gizmoz.au
```

No trailing slash. While testing on the subdomain, set it to
`https://new.gizmoz.au`, then change it to `https://gizmoz.au` the day you
switch over and restart the app. It defaults to `https://gizmoz.au`, so
leaving it unset is only safe once the main domain is live.

Check it worked: open `https://your-domain/robots.txt` — the `Sitemap:`
line at the bottom must show the domain you are actually using.

---

## 2. Add your model numbers — the single biggest win

Every product in the catalogue currently has an empty model number. That
is the one gap in the structured data, and it is the one thing only you
can fill.

It matters more than it sounds. Someone typing `20VH0016AU` into Google is
ready to buy — they have the exact part number from a school list or a
quote. There is almost no competition for those searches, and right now
Gizmoz cannot appear in any of them.

Go to `/manage`, open each product, and fill in **Model number**. The
structured data picks it up as both `sku` and `mpn` automatically, and the
page title and description start carrying it too.

---

## 3. Google Search Console

Free, and the only way to see what Google actually thinks of the site.

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add a **Domain** property for `gizmoz.au` (needs a DNS TXT record —
   add it wherever you manage DNS; VentraIP or your registrar)
3. Once verified: **Sitemaps** → submit `sitemap.xml`
4. **URL Inspection** → paste your home page → **Request indexing**

Then leave it alone for two weeks. Indexing is slow for a new site and
checking daily tells you nothing.

Do the same at [Bing Webmaster Tools](https://www.bing.com/webmasters) —
it imports straight from Search Console, takes two minutes, and Bing feeds
ChatGPT's web results.

---

## 4. Google Business Profile — set it up as a service-area business

Worth doing even without a shopfront, because it is what puts Gizmoz in
the map pack and in "near me" searches.

At [business.google.com](https://business.google.com), create the profile
and **when it asks whether customers visit you, say no**. It will then ask
which areas you serve — enter Rouse Hill, Kellyville, Castle Hill,
Baulkham Hills, Norwest and the rest. Your address is used only to verify
you and is never shown publicly.

Category: *Computer store*. Add *Computer repair service* and *Internet
service provider* as secondary.

Then: upload real photos, keep the phone number identical to the site
(`0424 620 511`, character for character), and **ask every happy customer
for a review**. Review count and recency are among the strongest local
ranking signals there are, and assistants quote them when comparing
sellers.

---

## 5. Keep your details identical everywhere

Search engines and assistants cross-check your business name, phone and
location across the web. Mismatches make them less confident, and less
confident means less visible.

The site, your Google Business Profile, Facebook, Instagram and eBay
should all say exactly:

```
Gizmoz
Rouse Hill, NSW 2155
0424 620 511
gizmozau@yahoo.com
```

Not "Gizmoz AU" in one place and "Gizmoz" in another. Not `+61 424 620 511`
on one and `0424620511` on the next.

---

## 6. Fix the voucher discrepancy

The BYOD page says the Back to School voucher gets you *"up to an
additional $150 off"*. The home-page promo says a $150 voucher gets you
*"an additional $50 off"*.

Both are live, so an assistant asked about Gizmoz's school discount will
pick one — possibly the wrong one — and state it as fact. Decide which is
correct and tell me; it is a one-line change in `lib/site.js` and one
paragraph in `pages/content.js`.

---

## 7. Content that would actually move the needle

Only if you have the time. In rough order of payoff:

- **A page per local school's BYOD requirements.** "Laptop for
  [school name] BYOD" is searched by every parent at enrolment, and nobody
  competes for it. One page per school, listing the spec and two devices
  that meet it, is probably the highest-ROI content this business can make.
- **More questions in the FAQ.** Write down what customers actually ask on
  the phone and send them to me — real questions beat invented ones, and
  they feed straight into what assistants quote.
- **An Instagram post embed on the home page.** Already scaffolded, just
  needs a permalink from you.
- **HP and Dell stock.** Those filter pages exist but are empty, so they
  deliberately keep themselves out of the index until they have something
  to show.

---

## What's already handled, for reference

You don't need to do anything about these — they're built and tested.

| | |
|---|---|
| `robots.txt` | Generated. All AI crawlers named and allowed. Admin path deliberately not listed. |
| `sitemap.xml` | Generated from live stock — new products appear automatically. |
| `llms.txt` | Plain-language brief for AI assistants, generated from live stock. |
| Canonical tags | Every page. Products previously pointed at `/shop` and could not be indexed. |
| Structured data | Organization, WebSite, WebPage, Breadcrumbs, Product + Offer, Service, FAQPage, ItemList. |
| Product data | Price, stock, condition, warranty, specs and returns policy, machine-readable. |
| FAQs | 17 questions across the home, BYOD, Wi-Fi and contact pages — visible and marked up. |
| Social previews | 1200×630 card at `/images/site/og-card.png`, plus Open Graph and Twitter tags. |
| Privacy | Street address and map removed from the public site; only the suburb is published. |
| Index hygiene | Cart, thanks, 404 and empty brand filters are `noindex`. Admin is `noindex, nofollow`. |

### Checking your own work

- Structured data: [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- Social preview: [opengraph.xyz](https://www.opengraph.xyz)
- Speed and basics: [pagespeed.web.dev](https://pagespeed.web.dev)

### To see what an AI assistant sees

Open `https://gizmoz.au/llms.txt`. That is the brief, and it regenerates
from live stock. If something there is wrong or missing, it is worth
fixing — that file is designed to be the thing an assistant trusts.
