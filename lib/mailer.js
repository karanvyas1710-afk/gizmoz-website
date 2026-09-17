'use strict';

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const site = require('./site');

/**
 * Form delivery.
 *
 * With SMTP credentials in the environment, submissions are emailed to
 * MAIL_TO (defaulting to the business address). Without them — which is how
 * the site behaves on a fresh Render deploy until the owners add their
 * mailbox details — every submission is still written to disk and logged, so
 * nothing a customer sends is ever silently dropped.
 */

const SUBMISSIONS_DIR = process.env.SUBMISSIONS_DIR || path.join(__dirname, '..', 'submissions');

let transporter = null;
let transportError = null;

function getTransporter() {
  if (transporter || transportError) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transportError = 'SMTP not configured';
    return null;
  }
  const port = Number(SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

function isMailConfigured() {
  return Boolean(getTransporter());
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Render `fields` (array of [label, value]) as plain text and as HTML. */
function renderBody(heading, fields) {
  const rows = fields.filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length));
  const text =
    `${heading}\n${'='.repeat(heading.length)}\n\n` +
    rows.map(([k, v]) => `${k}:\n  ${Array.isArray(v) ? v.join(', ') : String(v).replace(/\n/g, '\n  ')}`).join('\n\n') +
    `\n\n— sent from the Gizmoz website\n`;
  const html =
    `<h2 style="font-family:Poppins,Arial,sans-serif;color:#06283d">${escapeHtml(heading)}</h2>` +
    '<table style="font-family:Poppins,Arial,sans-serif;border-collapse:collapse;font-size:15px">' +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 16px 6px 0;vertical-align:top;color:#1363df;font-weight:600;white-space:nowrap">${escapeHtml(k)}</td>` +
          `<td style="padding:6px 0;vertical-align:top;color:#252525">${escapeHtml(Array.isArray(v) ? v.join(', ') : v).replace(/\n/g, '<br>')}</td></tr>`
      )
      .join('') +
    '</table><p style="font-family:Poppins,Arial,sans-serif;color:#7b8794;font-size:13px">Sent from the Gizmoz website.</p>';
  return { text, html };
}

/** Always keep a copy on disk, even when email succeeds. */
function persist(kind, payload) {
  try {
    fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(SUBMISSIONS_DIR, `${stamp}-${kind}.json`);
    fs.writeFileSync(file, JSON.stringify({ kind, receivedAt: new Date().toISOString(), ...payload }, null, 2));
    return file;
  } catch (err) {
    console.error('[gizmoz] could not persist submission:', err.message);
    return null;
  }
}

/**
 * Deliver a submission. Resolves to `{ delivered, stored }`; it rejects only
 * when SMTP is configured *and* the send fails, so the caller can tell the
 * customer to phone instead.
 */
async function send({ kind, subject, heading, fields, replyTo }) {
  const stored = persist(kind, { subject, fields });
  const tx = getTransporter();
  const { text, html } = renderBody(heading, fields);

  if (!tx) {
    console.log(`[gizmoz] ${kind} submission (email not configured, saved to disk)\n${text}`);
    return { delivered: false, stored };
  }

  await tx.sendMail({
    from: process.env.MAIL_FROM || `Gizmoz Website <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO || site.email,
    replyTo: replyTo || undefined,
    subject,
    text,
    html,
  });
  return { delivered: true, stored };
}

module.exports = { send, isMailConfigured };
