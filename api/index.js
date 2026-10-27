'use strict';

/**
 * Vercel entry point.
 *
 * Vercel runs each file under api/ as a serverless function. An Express app
 * is already a (req, res) handler, so it can be exported directly — the
 * rewrite in vercel.json sends every path here, apart from the static files
 * Vercel serves from public/ before it reaches this function at all.
 */

module.exports = require('../server');
