'use strict';

const fs = require('fs');
const path = require('path');

/**
 * The product catalogue, and where it lives on disk.
 *
 * The catalogue ships with the repo at data/products.json. Once the owner
 * edits anything, the working copy moves to DATA_DIR so that code deploys and
 * shop data stay separate — a deploy should never overwrite the prices the
 * owner just set.
 *
 * DATA_DIR should point at a Render persistent disk (e.g. /var/data). Without
 * one, the container's filesystem is wiped on every restart and edits are
 * lost; `isDurable()` reports which situation we're in so the admin UI can
 * say so plainly rather than pretending everything is saved.
 */

const REPO_DATA = path.join(__dirname, '..', 'data');
const SEED_FILE = path.join(REPO_DATA, 'products.json');

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : REPO_DATA;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let products = [];

/** True when DATA_DIR has been pointed somewhere outside the deployed code. */
function isDurable() {
  return path.resolve(DATA_DIR) !== path.resolve(REPO_DATA);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * Write via a temporary file and rename. A crash midway then leaves the
 * previous catalogue intact instead of a half-written file.
 */
function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  if (!fs.existsSync(PRODUCTS_FILE)) {
    // First run against an empty disk: seed from the catalogue in the repo.
    fs.copyFileSync(SEED_FILE, PRODUCTS_FILE);
  }

  try {
    products = readJson(PRODUCTS_FILE);
  } catch (err) {
    console.error('[gizmoz] products.json is unreadable, falling back to the shipped copy:', err.message);
    products = readJson(SEED_FILE);
  }
  return products;
}

function all() {
  return products;
}

function bySlug(slug) {
  return products.find((p) => p.slug === slug);
}

/** Replace the whole catalogue and persist it. */
function save(next) {
  products = next;
  writeAtomic(PRODUCTS_FILE, products);
  return products;
}

function upsert(product) {
  const i = products.findIndex((p) => p.slug === product.slug);
  const next = products.slice();
  if (i === -1) next.push(product);
  else next[i] = product;
  return save(next);
}

function remove(slug) {
  return save(products.filter((p) => p.slug !== slug));
}

/**
 * Resolve a stored image reference to the URL the browser should request.
 * Catalogue images that shipped with the repo are stored relative
 * ("products/dock-1.png"); anything the owner uploads is stored as an
 * absolute path ("/uploads/…") and served from the data directory.
 */
const PLACEHOLDER = '/images/site/placeholder.svg';

function imageUrl(ref) {
  if (!ref) return PLACEHOLDER; // a product whose photos aren't uploaded yet
  return ref.startsWith('/') ? ref : `/images/${ref}`;
}

/** Absolute path on disk for a stored image reference, or null. */
function imagePath(ref) {
  if (!ref) return null;
  if (ref.startsWith('/uploads/')) {
    const full = path.resolve(UPLOADS_DIR, ref.slice('/uploads/'.length));
    return full.startsWith(UPLOADS_DIR + path.sep) ? full : null;
  }
  if (ref.startsWith('/')) return null;
  const full = path.resolve(__dirname, '..', 'public', 'images', ref);
  const root = path.resolve(__dirname, '..', 'public', 'images');
  return full.startsWith(root + path.sep) ? full : null;
}

module.exports = {
  PLACEHOLDER,
  load,
  all,
  bySlug,
  save,
  upsert,
  remove,
  imageUrl,
  imagePath,
  isDurable,
  DATA_DIR,
  UPLOADS_DIR,
  PRODUCTS_FILE,
};
