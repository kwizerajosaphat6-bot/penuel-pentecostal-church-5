/**
 * Authentication & authorisation.
 * ------------------------------------------------------------------
 * Design:
 *  - Short-lived access JWT (15 min) carried in the Authorization header.
 *  - Long-lived refresh token, rotated on every use.
 *  - Only a SHA-256 hash of each refresh token is persisted.
 *  - Re-using an already-rotated refresh token is treated as theft and
 *    destroys every session belonging to that admin.
 *  - Role is re-read from the database on refresh, so a demotion takes
 *    effect within one access-token lifetime and cannot be escalated by
 *    editing a stale token payload.
 */

import jwt from "jsonwebtoken";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import config from "../config.js";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { httpError } from "./errors.js";

const hash = (value) => createHash("sha256").update(value).digest("hex");

/* ---------- token issuing ------------------------------------------- */

export async function issueTokens(admin) {
  const accessToken = jwt.sign(
    { role: admin.role, email: admin.email },
    config.jwt.secret,
    {
      subject: admin.id,
      expiresIn: config.jwt.accessTtl,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithm: "HS256",
    }
  );

  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + config.jwt.refreshDays * 86_400_000);

  await prisma.refreshToken.create({
    data: { tokenHash: hash(refreshToken), adminId: admin.id, expiresAt },
  });

  return { accessToken, refreshToken };
}

/* ---------- access-token verification -------------------------------- */

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next(httpError(401));

  const token = header.slice(7).trim();
  if (!token) return next(httpError(401));

  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithms: ["HS256"], // pinned: blocks the `alg:none` downgrade
    });
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    // Never surface the JWT library's reason (expired vs malformed vs
    // bad signature) — that is an oracle for an attacker.
    return next(httpError(401, "Your session has expired. Please sign in again."));
  }
}

/** Route guard: `requireRole("SUPER_ADMIN")`. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin) return next(httpError(401));
    if (!roles.includes(req.admin.role)) {
      logger.warn("authz.denied", {
        actor: req.admin.email,
        path: req.path,
        role: req.admin.role,
      });
      return next(httpError(403));
    }
    next();
  };
}

/* ---------- refresh rotation ----------------------------------------- */

export async function rotateRefreshToken(presentedToken) {
  const tokenHash = hash(presentedToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!stored) throw httpError(401, "Your session has expired. Please sign in again.");

  // Reuse detection: a revoked token being presented means someone kept a
  // copy. Destroy every session for that admin.
  if (stored.revokedAt) {
    await prisma.refreshToken.deleteMany({ where: { adminId: stored.adminId } });
    logger.error("auth.refresh_reuse", { adminId: stored.adminId });
    throw httpError(401, "Your session has expired. Please sign in again.");
  }

  if (stored.expiresAt < new Date() || !stored.admin.isActive) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw httpError(401, "Your session has expired. Please sign in again.");
  }

  // Mark old token spent, then issue a fresh pair.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(stored.admin);
}

export async function revokeAllSessions(adminId) {
  await prisma.refreshToken.deleteMany({ where: { adminId } });
}

/** Remove expired / spent tokens. Called on a timer from index.js. */
export async function pruneTokens() {
  const cutoff = new Date(Date.now() - 86_400_000);
  const { count } = await prisma.refreshToken.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }] },
  });
  if (count) logger.info("auth.pruned_tokens", { count });
}

/* ---------- constant-time compare ------------------------------------ */

export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* ---------- audit ----------------------------------------------------- */

export async function audit(actor, action, target = null, details = null) {
  try {
    await prisma.auditLog.create({ data: { actor, action, target, details } });
  } catch (err) {
    // Auditing must never break a request.
    logger.warn("audit.write_failed", { action, message: err.message });
  }
}
