'use strict';

const crypto = require('crypto');

/**
 * Password gate for the admin area.
 *
 * One shared password, set as ADMIN_PASSWORD. If it isn't set the admin area
 * does not exist at all — every route 404s. That is deliberate: a deployment
 * that forgot the variable should be closed, not open with a blank password.
 *
 * A successful login sets a cookie holding "expiry.signature", where the
 * signature is an HMAC over the expiry using a server-side secret. Nothing is
 * stored server-side, so this survives the restarts a free Render instance
 * goes through, and a tampered cookie fails the signature check.
 */

const COOKIE = 'gz_admin';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // a week

function password() {
  return process.env.ADMIN_PASSWORD || '';
}

function isEnabled() {
  return password().length > 0;
}

/**
 * Signing secret. SESSION_SECRET if provided, otherwise derived from the
 * password — which means changing the password also invalidates every
 * existing session, exactly what you want if it leaked.
 */
function secret() {
  return process.env.SESSION_SECRET || `derived:${password()}`;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(String(value)).digest('hex');
}

/** Compare in constant time, and without throwing on length mismatch. */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkPassword(candidate) {
  if (!isEnabled()) return false;
  return safeEqual(candidate || '', password());
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    acc[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    return acc;
  }, {});
}

function issue(res, req) {
  const expiry = Date.now() + MAX_AGE_MS;
  const value = `${expiry}.${sign(expiry)}`;
  const secure = req.secure || req.get('x-forwarded-proto') === 'https';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
      MAX_AGE_MS / 1000
    )}${secure ? '; Secure' : ''}`
  );
}

function clear(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function isLoggedIn(req) {
  if (!isEnabled()) return false;
  const raw = parseCookies(req)[COOKIE];
  if (!raw) return false;
  const [expiry, signature] = raw.split('.');
  if (!expiry || !signature) return false;
  if (!safeEqual(signature, sign(expiry))) return false;
  return Number(expiry) > Date.now();
}

module.exports = { isEnabled, checkPassword, issue, clear, isLoggedIn };
