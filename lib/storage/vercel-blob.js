'use strict';

/**
 * Vercel Blob storage — for serverless deploys, where the filesystem is
 * read-only outside /tmp and /tmp is not shared between invocations.
 *
 * The catalogue lives as a single JSON blob and the uploaded photos as one
 * blob each. That is enough for a shop this size and keeps the whole thing
 * on one integration with one token, rather than adding a database just to
 * hold seven rows.
 *
 * Blob URLs sit behind a CDN, so a plain re-fetch of the catalogue can serve
 * a stale copy right after the owner saves. `head()` is not cached, so we ask
 * it for the current `uploadedAt` and use that as a cache-buster — the read
 * costs an extra round trip but is always the version we just wrote.
 *
 * The SDK is required lazily: a deploy that never touches Blob (cPanel, local)
 * then does not fail if the package is missing.
 */

const fs = require('fs/promises');
const path = require('path');

const CATALOGUE_PATH = 'gizmoz/products.json';
const SEED_FILE = path.join(__dirname, '..', '..', 'data', 'products.json');

function sdk() {
  // eslint-disable-next-line global-require
  return require('@vercel/blob');
}

/** Blob is durable by definition — that is the entire reason it is here. */
function isDurable() {
  return true;
}

function imageUrl(ref) {
  return ref;
}

async function readCatalogue() {
  const { head } = sdk();

  let meta;
  try {
    meta = await head(CATALOGUE_PATH);
  } catch (err) {
    // First run against an empty store: seed from the catalogue in the repo.
    if (err && err.name === 'BlobNotFoundError') {
      const seed = JSON.parse(await fs.readFile(SEED_FILE, 'utf8'));
      await writeCatalogue(seed);
      return seed;
    }
    throw err;
  }

  const stamp = meta.uploadedAt ? new Date(meta.uploadedAt).getTime() : Date.now();
  const res = await fetch(`${meta.url}?v=${stamp}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Blob read failed: ${res.status} ${res.statusText}`);
  return res.json();
}

async function writeCatalogue(products) {
  const { put } = sdk();
  await put(CATALOGUE_PATH, JSON.stringify(products, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

async function putImage(filename, buffer, contentType) {
  const { put } = sdk();
  const blob = await put(`gizmoz/uploads/${filename}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  // The full URL is the reference: photos are served straight from the CDN
  // rather than through the app.
  return blob.url;
}

/** Nothing on Blob has a path on this machine. */
function imagePath() {
  return null;
}

async function deleteImage(ref) {
  if (!/^https?:\/\//i.test(ref)) return; // a repo image, not ours to delete
  const { del } = sdk();
  try {
    await del(ref);
  } catch (err) {
    // A photo already gone is not a failure worth surfacing to the owner.
    if (!err || err.name !== 'BlobNotFoundError') throw err;
  }
}

module.exports = {
  name: 'vercel-blob',
  isDurable,
  readCatalogue,
  writeCatalogue,
  putImage,
  deleteImage,
  imagePath,
  imageUrl,
  CATALOGUE_PATH,
};
