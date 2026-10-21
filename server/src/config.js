/**
 * Runtime configuration.
 * ------------------------------------------------------------------
 * Every value is read from the environment. Nothing sensitive is ever
 * written in source. In production the process refuses to boot if a
 * required secret is missing or too weak — failing loudly at start-up
 * is far safer than silently running with a default secret.
 */

import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";
const problems = [];

function required(name, { minLength = 0 } = {}) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    problems.push(`${name} is required`);
    return "";
  }
  if (minLength && value.length < minLength) {
    problems.push(`${name} must be at least ${minLength} characters`);
    return value;
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

function int(name, fallback) {
  const parsed = parseInt(optional(name, String(fallback)), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(name, fallback) {
  return optional(name, String(fallback)) === "true";
}

/**
 * Origins allowed to call this API. Comma separated.
 * There is no wildcard fallback: an unknown origin is always rejected.
 */
const allowedOrigins = optional(
  "ALLOWED_ORIGINS",
  isProd ? "" : "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (isProd && allowedOrigins.length === 0) {
  problems.push("ALLOWED_ORIGINS is required in production");
}

const config = {
  env: process.env.NODE_ENV || "development",
  isProd,
  port: int("PORT", 4000),
  // Render provides the port and requires binding to 0.0.0.0.
  host: optional("HOST", isProd ? "0.0.0.0" : "127.0.0.1"),

  allowedOrigins,

  /**
   * The admin API lives behind an unguessable base path supplied by the
   * environment. This is defence in depth only — every route underneath
   * still enforces authentication and role checks.
   */
  adminBasePath: optional("ADMIN_API_PATH", "/api/manage").replace(/\/$/, ""),

  jwt: {
    // 64+ chars. Generate with:
    //   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
    secret: isProd
      ? required("JWT_SECRET", { minLength: 32 })
      : optional("JWT_SECRET", "dev-only-insecure-secret-not-for-production"),
    accessTtl: optional("JWT_ACCESS_TTL", "15m"),
    refreshDays: int("JWT_REFRESH_DAYS", 7),
    issuer: "penuelpentecostalchurch.org",
    audience: "penuel-admin",
  },

  limits: {
    auth: int("RATE_LIMIT_AUTH", 5),
    write: int("RATE_LIMIT_WRITE", 10),
    general: int("RATE_LIMIT_GENERAL", 120),
  },

  lockout: {
    maxAttempts: int("LOGIN_MAX_ATTEMPTS", 8),
    minutes: int("LOGIN_LOCKOUT_MINUTES", 15),
  },

  // Structured logs to stdout; Render captures these automatically.
  logLevel: optional("LOG_LEVEL", isProd ? "info" : "debug"),
  trustProxy: bool("TRUST_PROXY", isProd),
};

if (problems.length > 0) {
  // Deliberately terse: this is printed to the server console only.
  console.error("[config] invalid environment:\n - " + problems.join("\n - "));
  if (isProd) process.exit(1);
}

export default config;
