/**
 * Penuel Pentecostal Church — API server.
 * ------------------------------------------------------------------
 * Hardened Express application. Serves JSON only; the website itself is
 * static and hosted separately on Cloudflare Pages.
 */

import express from "express";
import compression from "compression";

import config from "./config.js";
import logger from "./lib/logger.js";
import prisma from "./lib/prisma.js";
import { pruneTokens } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  hppMiddleware,
  scrubFingerprints,
  requireJson,
} from "./middleware/security.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import publicRoutes from "./routes/public.js";

const app = express();

/* ---------- platform ---------------------------------------------------- */

// Render terminates TLS at its edge. Trust exactly one proxy hop so that
// `req.ip` is the real client (needed for rate limiting) without letting a
// client spoof `X-Forwarded-For`.
app.set("trust proxy", config.trustProxy ? 1 : false);
app.disable("x-powered-by");
app.disable("etag"); // no entity tags on JSON — avoids cache-probing

/* ---------- security ---------------------------------------------------- */

app.use(scrubFingerprints);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compression({ level: 6, threshold: 1024 }));
app.use(requireJson);
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(hppMiddleware);
app.use(generalLimiter);

/* ---------- health ------------------------------------------------------ */

// Used by Render's health check. Returns nothing that identifies the stack.
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

/* ---------- routes ------------------------------------------------------ */

// Auth and admin both live under the unguessable base path.
app.use(config.adminBasePath, authRoutes);
app.use(config.adminBasePath, adminRoutes);
app.use("/api", publicRoutes);

/* ---------- fallbacks --------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

/* ---------- lifecycle --------------------------------------------------- */

const server = app.listen(config.port, config.host, () => {
  logger.info("server.started", { env: config.env, port: config.port });
});

// Housekeeping: clear expired refresh tokens hourly.
const pruneTimer = setInterval(() => {
  pruneTokens().catch((err) =>
    logger.error("prune.failed", { message: err.message })
  );
}, 3_600_000);
pruneTimer.unref();

async function shutdown(signal) {
  logger.info("server.stopping", { signal });
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
  // Force-exit if connections refuse to drain.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Never let an unexpected rejection print a stack trace to a response.
process.on("unhandledRejection", (reason) =>
  logger.error("unhandled.rejection", { message: String(reason) })
);
process.on("uncaughtException", (err) => {
  logger.error("unhandled.exception", { message: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

export default app;
