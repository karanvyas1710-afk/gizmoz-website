# Deploying to Vercel

The app runs as a single serverless function. Static files in `public/` are
served by Vercel's CDN and never touch it. The catalogue and uploaded photos
live in **Vercel Blob**, because the deployment filesystem is read-only and
each invocation gets its own `/tmp` — without Blob, every price the owner
saves would vanish within seconds.

Nothing here breaks the cPanel setup. The app picks its storage backend from
whether `BLOB_READ_WRITE_TOKEN` is present, so the same code runs on both.

---

## Before you start

If you have **already changed any prices, stock or photos** through
`/manage` on cPanel, grab that data first — Vercel starts from the copy in
the repo, not from your cPanel disk.

In cPanel File Manager, download `/home/gizmozne/gizmoz-data/products.json`
and send it to me. I'll commit it so Vercel seeds from the current catalogue
instead of the original one. If you've only ever looked at `/manage` without
saving, skip this.

---

## 1. Import the project

1. [vercel.com/new](https://vercel.com/new) → import `karanvyas1710-afk/gizmoz-website`
2. **Framework Preset:** Other
3. Leave Build Command, Output Directory and Install Command empty — Vercel
   reads `vercel.json` and finds the function itself
4. Don't deploy yet. Add the storage and the variables first, or the first
   build will come up without a catalogue and without the stock manager.

## 2. Create the Blob store

In the project → **Storage** → **Create** → **Blob** → name it `gizmoz` →
**Connect to Project**.

That sets `BLOB_READ_WRITE_TOKEN` automatically. **Don't set it by hand** —
it's how the app knows to use Blob rather than a disk.

## 3. Environment variables

Project → **Settings** → **Environment Variables**. Tick all three
environments (Production, Preview, Development) for each.

| Key | Value |
|---|---|
| `SITE_URL` | `https://gizmoz.au` |
| `ADMIN_PASSWORD` | your chosen password |
| `SESSION_SECRET` | output of `openssl rand -hex 32` |
| `SMTP_HOST` | `smtp.mail.yahoo.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `gizmozau@yahoo.com` |
| `SMTP_PASS` | your Yahoo app password |
| `MAIL_TO` | `gizmozau@yahoo.com` |

Notes:

- **Do not set** `DATA_DIR`, `SUBMISSIONS_DIR`, `PORT` or `NODE_ENV`. The
  first two are for disk-based hosts and setting them on Vercel does
  nothing useful; the last two are Vercel's to manage.
- `SITE_URL` drives every canonical tag, sitemap URL and piece of structured
  data. Until your real domain is attached, set it to the
  `*.vercel.app` URL Vercel gives you, then change it when the domain is
  live. Getting it wrong tells Google the real site is somewhere else.
- **SMTP is not optional here.** On a disk-based host a failed email still
  leaves a copy of the submission on disk. On Vercel that copy goes to a
  temp directory that disappears, so if SMTP isn't configured a customer
  enquiry is genuinely lost.
- `ADMIN_PATH` is optional and defaults to `/manage`.

## 4. Deploy, then check it

Visit `https://your-deployment/healthz`. You want:

```json
{"ok":true,"mail":true,"admin":true,"storage":"persistent","backend":"vercel-blob"}
```

| Field | If it's wrong |
|---|---|
| `backend` not `vercel-blob` | The Blob store isn't connected. Storage → Connect to Project, then redeploy. |
| `storage` is `ephemeral` | Same cause as above. |
| `admin` is `false` | `ADMIN_PASSWORD` isn't set, so `/manage` will 404. |
| `mail` is `false` | One of the SMTP variables is missing or misspelt. |

Changing an environment variable needs a **redeploy** to take effect —
Deployments → ⋯ → Redeploy. Vercel does not restart on a variable change.

## 5. Then test it properly

1. Open `/manage`, change a price, and confirm the shop page shows it
2. **Redeploy**, then check the price is still your new one — that's the
   test that proves Blob is doing its job
3. Upload a product photo and confirm it appears on the shop page
4. Send yourself a message through the contact form

## 6. Point the domain at it

Project → **Settings** → **Domains** → add `gizmoz.au`. Vercel shows the DNS
records to create; add them wherever you manage DNS. Then set `SITE_URL` to
`https://gizmoz.au` and redeploy.

Once that's live, update the sitemap in Google Search Console (see `SEO.md`)
so it points at the right domain.

---

## Things worth knowing

**Prices can lag by up to 30 seconds.** Vercel runs several instances and
each holds its own copy of the catalogue, refreshed every 30 seconds. After
the owner saves a price, another visitor might see the old one briefly.
`/manage` always forces a fresh read, so the owner never sees a stale
version of their own edit. Tune it with `CATALOGUE_TTL_MS` if you want.

**Photos are served from Vercel's CDN,** not through the app, so they're
fast and don't count against function time.

**The free plan is almost certainly enough** for a shop this size. Blob has
a storage allowance rather than a per-request charge, and the function only
runs for real page requests — static assets bypass it entirely.

**Keeping cPanel as a fallback is fine.** The same commit runs on both: with
`DATA_DIR` set and no Blob token it uses the disk, with the Blob token it
uses Blob. They'd be separate catalogues, though, so edit in one place only.
