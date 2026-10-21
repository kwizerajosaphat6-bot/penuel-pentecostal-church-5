/**
 * Minimal structured logger with automatic secret redaction.
 * ------------------------------------------------------------------
 * Detailed information is written to stdout (captured by Render) and is
 * NEVER sent to a client. Anything that looks like a credential is
 * replaced before it reaches the log, so an accidental
 * `logger.error({ body })` cannot leak a password.
 */

import config from "../config.js";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[config.logLevel] ?? LEVELS.info;

const SECRET_KEYS =
  /^(password|passwordhash|token|accesstoken|refreshtoken|authorization|cookie|secret|databaseurl|jwt.*)$/i;

function redact(value, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return value;
  if (typeof value === "string") {
    // Strip anything resembling a bearer token or connection string.
    return value
      .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, "Bearer [redacted]")
      .replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgres://[redacted]");
  }
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SECRET_KEYS.test(k) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function emit(level, message, meta) {
  if (LEVELS[level] < threshold) return;
  const line = {
    t: new Date().toISOString(),
    level,
    msg: message,
    ...(meta ? { meta: redact(meta) } : {}),
  };
  const text = JSON.stringify(line);
  if (level === "error") console.error(text);
  else if (level === "warn") console.warn(text);
  else console.log(text);
}

export const logger = {
  debug: (m, meta) => emit("debug", m, meta),
  info: (m, meta) => emit("info", m, meta),
  warn: (m, meta) => emit("warn", m, meta),
  error: (m, meta) => emit("error", m, meta),
};

export default logger;
