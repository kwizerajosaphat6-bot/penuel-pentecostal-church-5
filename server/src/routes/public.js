/**
 * Public routes.
 * ------------------------------------------------------------------
 * Unauthenticated, aggressively rate-limited, and strictly read-only
 * except for the two inbound forms.
 *
 * Every read uses an explicit `select` so a future column (an internal
 * note, a moderation flag) cannot leak by accident.
 */

import { Router } from "express";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { schemas, validate } from "../lib/validate.js";
import { writeLimiter } from "../middleware/security.js";
import { asyncRoute } from "../middleware/errors.js";

const router = Router();

/** Public content is safe to cache at the CDN for a minute. */
const cacheable = (_req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
  );
  next();
};

/** Store only the /24 network, never a full address. */
function originHint(req) {
  const ip = (req.ip || "").replace("::ffff:", "");
  if (!ip.includes(".")) return null;
  return ip.split(".").slice(0, 3).join(".") + ".0";
}

/* ---------- content ---------------------------------------------------- */

router.get(
  "/sermons",
  cacheable,
  asyncRoute(async (_req, res) => {
    res.json(
      await prisma.sermon.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
          day: true,
          month: true,
          title: true,
          scripture: true,
          preacher: true,
        },
      })
    );
  })
);

router.get(
  "/occasions",
  cacheable,
  asyncRoute(async (_req, res) => {
    const select = {
      id: true,
      day: true,
      month: true,
      title: true,
      time: true,
      type: true,
      detail: true,
    };
    const [events, announcements] = await Promise.all([
      prisma.event.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select,
      }),
      prisma.announcement.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select,
      }),
    ]);
    res.json([...events, ...announcements]);
  })
);

router.get(
  "/testimonies",
  cacheable,
  asyncRoute(async (_req, res) => {
    res.json(
      await prisma.testimony.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, name: true, role: true, quote: true },
      })
    );
  })
);

router.get(
  "/services",
  cacheable,
  asyncRoute(async (_req, res) => {
    res.json(
      await prisma.service.findMany({
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          day: true,
          time: true,
          name: true,
          description: true,
          featured: true,
        },
      })
    );
  })
);

/* ---------- inbound forms ---------------------------------------------- */

router.post(
  "/contact",
  writeLimiter,
  validate(schemas.contact),
  asyncRoute(async (req, res) => {
    const { name, email, subject, message, company } = req.body;

    // Honeypot tripped: answer exactly like a success so the bot does not
    // learn it was detected, but persist nothing.
    if (company) {
      logger.warn("contact.honeypot");
      return res.status(202).json({ reference: "RECEIVED" });
    }

    const rec = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || "General",
        message,
        originHint: originHint(req),
      },
      select: { id: true },
    });

    res.status(202).json({ reference: rec.id.slice(0, 8).toUpperCase() });
  })
);

router.post(
  "/prayer",
  writeLimiter,
  validate(schemas.prayer),
  asyncRoute(async (req, res) => {
    const { name, email, message, company } = req.body;
    if (company) return res.status(202).json({ reference: "RECEIVED" });

    const rec = await prisma.prayerRequest.create({
      data: { name, email: email || "", message },
      select: { id: true },
    });
    res.status(202).json({ reference: rec.id.slice(0, 8).toUpperCase() });
  })
);

export default router;
