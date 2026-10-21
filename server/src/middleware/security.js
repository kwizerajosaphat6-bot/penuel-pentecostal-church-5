/**
 * HTTP security middleware.
 * ------------------------------------------------------------------
 * Everything that hardens the transport / header layer lives here.
 */

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import config from "../config.js";
import logger from "../lib/logger.js";

/* ---------- headers ------------------------------------------------ */

export const helmetMiddleware = helmet({
  // This is a JSON API. It never returns HTML, so the CSP can be maximally
  // restrictive: nothing may be loaded or executed from an API response.
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "same-site" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "no-referrer" },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  // `X-XSS-Protection` is legacy and can itself introduce bugs; disable it.
  xssFilter: false,
  dnsPrefetchControl: { allow: false },
  ieNoOpen: true,
  originAgentCluster: true,
});

/**
 * Strip every header that reveals the stack, and add the few that
 * helmet does not set for us.
 */
export function scrubFingerprints(_req, res, next) {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  res.removeHeader("Via");
  res.removeHeader("X-AspNet-Version");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()"
  );
  // Never allow an API response to be cached by a shared proxy by default.
  res.setHeader("Cache-Control", "no-store");
  next();
}

/* ---------- CORS ---------------------------------------------------- */

export const corsMiddleware = cors({
  origin(origin, callback) {
    // Same-origin / server-to-server requests carry no Origin header.
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    logger.warn("cors.rejected", { origin });
    // Do not throw: throwing produces a 500. Simply refuse the CORS grant,
    // which the browser turns into a network error for the caller.
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
  optionsSuccessStatus: 204,
});

/* ---------- rate limiting ------------------------------------------- */

const limiterDefaults = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Render sits behind a proxy; use the left-most forwarded address.
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    logger.warn("ratelimit.hit", { path: req.path });
    res.status(429).json({ error: "Too many requests. Please try again shortly." });
  },
};

/** Broad protection for the whole API. */
export const generalLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: 60_000,
  limit: config.limits.general,
});

/** Login: very tight, per-IP, long window. */
export const authLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: 15 * 60_000,
  limit: config.limits.auth,
  skipSuccessfulRequests: true,
});

/** Public write endpoints (contact / prayer): stops form-spam floods. */
export const writeLimiter = rateLimit({
  ...limiterDefaults,
  windowMs: 10 * 60_000,
  limit: config.limits.write,
});

/* ---------- misc ----------------------------------------------------- */

/** Blocks `?a=1&a=2` array-smuggling into query parsers. */
export const hppMiddleware = hpp();

/** Reject bodies with an unexpected content type. */
export function requireJson(req, res, next) {
  if (["POST", "PATCH", "PUT"].includes(req.method)) {
    const type = req.headers["content-type"] || "";
    if (!type.includes("application/json")) {
      return res.status(415).json({ error: "Unsupported media type." });
    }
  }
  next();
}
