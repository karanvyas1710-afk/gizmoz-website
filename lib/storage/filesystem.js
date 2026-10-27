'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

/**
 * Filesystem storage — local development, cPanel, and anywhere else with a
 * real disk. This is the original behaviour, kept intact.
 *
 * DATA_DIR should point somewhere outside the deployed code so a `git pull`
 * never overwrites the prices the owner just set. When it isn't, `isDurable()`
 * reports false and the admin UI says so rather than pretending.
 */

const REPO_DATA = path.join(__dirname, '..', '..', 'data');
const SEED_FILE = path.join(REPO_DATA, 'products.json');

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : REPO_DATA;
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function isDurable() {
  return path.resolve(DATA_DIR) !== path.resolve(REPO_DATA);
}

/** Uploaded photos are served by the app from /uploads. */
function imageUrl(ref) {
  return ref;
}

async function readCatalogue() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });

  if (!fs.existsSync(PRODUCTS_FILE)) {
    // First run against an empty disk: seed from the catalogue in the repo.
    await fsp.copyFile(SEED_FILE, PRODUCTS_FILE);
  }
  return JSON.parse(await fsp.readFile(PRODUCTS_FILE, 'utf8'));
}

/**
 * Write via a temporary file and rename. A crash midway then leaves the
 * previous catalogue intact instead of a half-written file.
 */
async function writeCatalogue(products) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${PRODUCTS_FILE}.${process.pid}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(products, null, 2));
  await fsp.rename(tmp, PRODUCTS_FILE);
}

async function putImage(filename, buffer) {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  await fsp.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

/** Absolute path on disk for a stored image reference, or null if it isn't ours. */
function imagePath(ref) {
  if (!ref) return null;
  if (ref.startsWith('/uploads/')) {
    const full = path.resolve(UPLOADS_DIR, ref.slice('/uploads/'.length));
    return full.startsWith(UPLOADS_DIR + path.sep) ? full : null;
  }
  if (ref.startsWith('/') || /^https?:\/\//i.test(ref)) return null;
  const root = path.resolve(__dirname, '..', '..', 'public', 'images');
  const full = path.resolve(root, ref);
  return full.startsWith(root + path.sep) ? full : null;
}

async function deleteImage(ref) {
  const file = imagePath(ref);
  if (file && ref.startsWith('/uploads/')) await fsp.rm(file, { force: true });
}

module.exports = {
  name: 'filesystem',
  isDurable,
  readCatalogue,
  writeCatalogue,
  putImage,
  deleteImage,
  imagePath,
  imageUrl,
  DATA_DIR,
  UPLOADS_DIR,
  PRODUCTS_FILE,
};
