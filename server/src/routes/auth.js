/**
 * Authentication routes.
 * ------------------------------------------------------------------
 * POST  <admin>/session   -> sign in
 * POST  <admin>/session/renew -> rotate refresh token
 * POST  <admin>/session/end   -> sign out (revokes the family)
 *
 * Anti-enumeration: a wrong e-mail and a wrong password produce the same
 * status, the same body and (via a dummy bcrypt compare) the same timing.
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import config from "../config.js";
import { schemas, validate } from "../lib/validate.js";
import { authLimiter } from "../middleware/security.js";
import { asyncRoute, httpError } from "../middleware/errors.js";
import {
  issueTokens,
  rotateRefreshToken,
  revokeAllSessions,
  requireAuth,
  audit,
} from "../middleware/auth.js";

const router = Router();

// A real hash to compare against when the account does not exist, so the
// response time does not reveal whether the e-mail is registered.
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.9Zg1JcOQ0zJqTS0Lw1Nn8W5c8Yy8sJq";

const GENERIC_LOGIN_FAILURE = "The e-mail or password is incorrect.";

router.post(
  "/session",
  authLimiter,
  validate(schemas.login),
  asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      await bcrypt.compare(password, DUMMY_HASH);
      logger.warn("auth.login_failed", { email, reason: "no_account" });
      throw httpError(401, GENERIC_LOGIN_FAILURE);
    }

    // Account lockout after repeated failures.
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      await bcrypt.compare(password, DUMMY_HASH);
      logger.warn("auth.login_locked", { email });
      throw httpError(
        423,
        "This account is temporarily locked. Please try again later."
      );
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);

    if (!ok) {
      const attempts = admin.failedLogins + 1;
      const lock = attempts >= config.lockout.maxAttempts;
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          failedLogins: lock ? 0 : attempts,
          lockedUntil: lock
            ? new Date(Date.now() + config.lockout.minutes * 60_000)
            : admin.lockedUntil,
        },
      });
      logger.warn("auth.login_failed", { email, attempts, locked: lock });
      await audit(email, "login_failed");
      throw httpError(401, GENERIC_LOGIN_FAILURE);
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const tokens = await issueTokens(admin);
    await audit(admin.email, "login_success", admin.id);
    logger.info("auth.login_success", { email });

    res.json({
      ...tokens,
      admin: { name: admin.name, email: admin.email, role: admin.role },
    });
  })
);

router.post(
  "/session/renew",
  validate(schemas.refresh),
  asyncRoute(async (req, res) => {
    const tokens = await rotateRefreshToken(req.body.refreshToken);
    res.json(tokens);
  })
);

router.post(
  "/session/end",
  requireAuth,
  asyncRoute(async (req, res) => {
    await revokeAllSessions(req.admin.id);
    await audit(req.admin.email, "logout", req.admin.id);
    res.status(204).end();
  })
);

/** Lets the SPA confirm a token is still good without exposing anything. */
router.get(
  "/session",
  requireAuth,
  asyncRoute(async (req, res) => {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { name: true, email: true, role: true, isActive: true },
    });
    if (!admin || !admin.isActive) throw httpError(401);
    res.json({ admin });
  })
);

export default router;
