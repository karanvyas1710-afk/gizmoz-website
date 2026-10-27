'use strict';

/**
 * The product catalogue.
 *
 * Where it is kept depends on the deploy. With a real disk (local, cPanel)
 * it is a JSON file under DATA_DIR. On a serverless host, where the
 * filesystem is read-only and nothing survives between invocations, it is a
 * blob in Vercel Blob. `lib/storage/` holds one backend per case and this
 * module picks between them on BLOB_READ_WRITE_TOKEN, which Vercel sets for
 * you when the Blob store is attached.
 *
 * Reads are synchronous against an in-memory snapshot, because the page
 * templates render synchronously and threading `await` through all of them
 * to fetch seven products would be a poor trade. `ready()` refreshes that
 * snapshot and is awaited once per request in middleware.
 *
 * The snapshot has a short TTL. Serverless runs many instances and each
 * holds its own copy, so after the owner saves a price the other instances
 * keep serving the old one until their copy expires — seconds, on a shop
 * catalogue, and the admin area forces a refresh so the owner always sees
 * the truth rather than a stale read of their own edit.
 */

const filesystem = require('./storage/filesystem');

const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const backend = USE_BLOB ? require('./storage/vercel-blob') : filesystem;

/** How long a loaded snapshot is trusted before it is re-read. */
const TTL_MS = Number(process.env.CATALOGUE_TTL_MS || 30_000);

const PLACEHOLDER = '/images/site/placeholder.svg';

let products = [];
let loadedAt = 0;
let inFlight = null;

/**
 * Make sure the snapshot is loaded and reasonably fresh.
 * Concurrent callers share one read rather than stampeding the backend.
 *
 * @param {boolean} [force]  Re-read even if the snapshot is still young.
 */
function ready({ force = false } = {}) {
  const fresh = loadedAt && Date.now() - loadedAt < TTL_MS;
  if (fresh && !force) return Promise.resolve(products);
  if (inFlight) return inFlight;

  inFlight = backend
    .readCatalogue()
    .then((next) => {
      if (!Array.isArray(next)) throw new Error('catalogue is not an array');
      products = next;
      loadedAt = Date.now();
      return products;
    })
    .catch((err) => {
      console.error('[gizmoz] could not read the catalogue:', err.message);
      // Serve whatever we last had rather than an empty shop. On a cold
      // start there is nothing to fall back to, so seed from the repo copy.
      if (!products.length) {
        try {
          products = require('../data/products.json');
          console.error('[gizmoz] falling back to the catalogue shipped with the code.');
        } catch {
          products = [];
        }
      }
      return products;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

function all() {
  return products;
}

function bySlug(slug) {
  return products.find((p) => p.slug === slug);
}

/** Replace the whole catalogue and persist it. */
async function save(next) {
  await backend.writeCatalogue(next);
  products = next;
  loadedAt = Date.now();
  return products;
}

async function upsert(product) {
  const i = products.findIndex((p) => p.slug === product.slug);
  const next = products.slice();
  if (i === -1) next.push(product);
  else next[i] = product;
  return save(next);
}

async function remove(slug) {
  return save(products.filter((p) => p.slug !== slug));
}

/**
 * Resolve a stored image reference to the URL the browser should request.
 *
 * Three shapes exist. Images that shipped with the repo are relative
 * ("products/dock-1.png"). Photos uploaded to a disk are absolute paths
 * ("/uploads/…") served by the app. Photos uploaded to Blob are already full
 * URLs and are served straight from the CDN.
 */
function imageUrl(ref) {
  if (!ref) return PLACEHOLDER; // a product whose photos aren't uploaded yet
  if (/^https?:\/\//i.test(ref)) return ref;
  return ref.startsWith('/') ? ref : `/images/${ref}`;
}

/** Store an uploaded photo and return the reference to save on the product. */
function putImage(filename, buffer, contentType) {
  return backend.putImage(filename, buffer, contentType);
}

function deleteImage(ref) {
  return backend.deleteImage(ref);
}

function imagePath(ref) {
  return backend.imagePath(ref);
}

/** True when saved changes will outlive a restart or redeploy. */
function isDurable() {
  return backend.isDurable();
}

module.exports = {
  PLACEHOLDER,
  ready,
  all,
  bySlug,
  save,
  upsert,
  remove,
  imageUrl,
  imagePath,
  putImage,
  deleteImage,
  isDurable,
  backend: backend.name,
  // Only meaningful for the filesystem backend; the admin area serves
  // uploads from here when there is a disk.
  UPLOADS_DIR: filesystem.UPLOADS_DIR,
};
