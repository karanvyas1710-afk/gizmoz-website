'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Intrinsic image dimensions, read straight from the file header.
 *
 * Every <img> the site renders carries width/height attributes so the browser
 * can reserve the right box before the bytes arrive. That kills layout shift,
 * and it also stops `loading="lazy"` images from collapsing to zero height —
 * a zero-height image never intersects the viewport, so it would never load.
 *
 * Results are cached, so each file is read once per process.
 */

const cache = new Map();

function readPng(buf) {
  // 8-byte signature, then the IHDR chunk: length(4) type(4) width(4) height(4)
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(12) !== 0x49484452) return null; // "IHDR"
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readJpeg(buf) {
  let offset = 2; // skip SOI
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    // SOF0–SOF15 carry the frame dimensions; C4/C8/CC are not frame headers.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }
  return null;
}

/**
 * @param {string} relPath Path under public/images, e.g. "products/dock-1.png".
 * @returns {{width: number, height: number}|null}
 */
function imageSize(relPath) {
  if (cache.has(relPath)) return cache.get(relPath);

  let size = null;
  try {
    // store.imagePath resolves both bundled images and uploads, and returns
    // null for anything trying to climb out of those directories.
    const full = require('./store').imagePath(relPath);
    if (full) {
      const fd = fs.openSync(full, 'r');
      const buf = Buffer.alloc(65536);
      const bytes = fs.readSync(fd, buf, 0, buf.length, 0);
      fs.closeSync(fd);
      // Sniff the format from the magic bytes rather than the file extension,
      // so a mislabelled file still reports its true dimensions.
      const head = buf.subarray(0, bytes);
      if (head.length >= 8 && head.readUInt32BE(0) === 0x89504e47) {
        size = readPng(head);
      } else if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8) {
        size = readJpeg(head);
      }
    }
  } catch {
    size = null; // Missing or unreadable: fall back to no attributes.
  }

  cache.set(relPath, size);
  return size;
}

/** Renders ` width="W" height="H"`, or an empty string if unknown. */
function sizeAttrs(relPath) {
  const size = imageSize(relPath);
  return size ? ` width="${size.width}" height="${size.height}"` : '';
}

module.exports = { imageSize, sizeAttrs };
