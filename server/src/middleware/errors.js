/**
 * Centralised error handling.
 * ------------------------------------------------------------------
 * Rule: the client learns *what* went wrong in the broadest possible
 * terms; the server log records *why*. No stack trace, file path, SQL
 * fragment, Prisma code or driver message ever crosses the wire.
 */

import logger from "../lib/logger.js";

/** Safe, deliberately vague messages keyed by HTTP status. */
const PUBLIC_MESSAGES = {
  400: "Some of the information provided is not valid.",
  401: "Authentication is required.",
  403: "You do not have permission to do that.",
  404: "Not found.",
  409: "That conflicts with something that already exists.",
  413: "That request is too large.",
  415: "Unsupported media type.",
  429: "Too many requests. Please try again shortly.",
  500: "Something went wrong. Please try again later.",
};

/** 404 handler — identical shape to every other error, so probing a
 *  path tells an attacker nothing about whether it exists. */
export function notFound(_req, res) {
  res.status(404).json({ error: PUBLIC_MESSAGES[404] });
}

export function errorHandler(err, req, res, _next) {
  // Prisma errors carry table/column names — map them to neutral codes.
  let status = err.status || 500;
  if (err.code === "P2002") status = 409; // unique constraint
  if (err.code === "P2025") status = 404; // record not found
  if (err.type === "entity.too.large") status = 413;
  if (err.type === "entity.parse.failed") status = 400;

  // Full detail -> server log only.
  const level = status >= 500 ? "error" : "warn";
  logger[level]("request.failed", {
    status,
    method: req.method,
    path: req.path,
    name: err.name,
    code: err.code,
    message: err.message,
    ...(status >= 500 ? { stack: err.stack } : {}),
  });

  const body = { error: err.publicMessage || PUBLIC_MESSAGES[status] || PUBLIC_MESSAGES[500] };
  // For validation failures it is genuinely useful (and harmless) to say
  // which fields were rejected — but never why, and never their contents.
  if (status === 400 && Array.isArray(err.fields) && err.fields.length) {
    body.fields = err.fields;
  }
  res.status(status).json(body);
}

/** Wrap an async route so rejected promises reach `errorHandler`. */
export function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/** Build an error with a safe public message. */
export function httpError(status, publicMessage) {
  const err = new Error(publicMessage || PUBLIC_MESSAGES[status]);
  err.status = status;
  err.publicMessage = publicMessage || PUBLIC_MESSAGES[status];
  return err;
}
