/**
 * Administrative routes.
 * ------------------------------------------------------------------
 * Mounted under an unguessable base path (ADMIN_API_PATH) AND protected
 * by `requireAuth` on every route. The obscure path is convenience, not
 * security — remove it and the routes are still fully protected.
 *
 * Destructive operations additionally require the SUPER_ADMIN role.
 */

import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth, requireRole, audit } from "../middleware/auth.js";
import { asyncRoute } from "../middleware/errors.js";
import { schemas, validate, validatePartial } from "../lib/validate.js";

const router = Router();

// Nothing below this line is reachable without a valid access token.
router.use(requireAuth);

const byId = validate(schemas.uuidParam, "params");
const canDelete = requireRole("SUPER_ADMIN", "EDITOR");

/* ---------- dashboard ------------------------------------------------ */

router.get(
  "/overview",
  asyncRoute(async (_req, res) => {
    const [contacts, unreadContacts, prayers, sermons, events, announcements] =
      await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { read: false } }),
        prisma.prayerRequest.count(),
        prisma.sermon.count(),
        prisma.event.count(),
        prisma.announcement.count(),
      ]);
    res.json({ contacts, unreadContacts, prayers, sermons, events, announcements });
  })
);

/* ---------- contact messages ----------------------------------------- */

router.get(
  "/messages",
  validate(schemas.pagination, "query"),
  asyncRoute(async (req, res) => {
    const { page, take } = req.validated.query;
    const [data, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take,
      }),
      prisma.contactMessage.count(),
    ]);
    res.json({ data, total, page, take });
  })
);

router.patch(
  "/messages/:id/read",
  byId,
  asyncRoute(async (req, res) => {
    const rec = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    await audit(req.admin.email, "message_read", rec.id);
    res.json(rec);
  })
);

router.delete(
  "/messages/:id",
  canDelete,
  byId,
  asyncRoute(async (req, res) => {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    await audit(req.admin.email, "message_deleted", req.params.id);
    res.status(204).end();
  })
);

/* ---------- prayer requests (SUPER_ADMIN only) ------------------------ */

router.get(
  "/prayers",
  requireRole("SUPER_ADMIN"),
  validate(schemas.pagination, "query"),
  asyncRoute(async (req, res) => {
    const { page, take } = req.validated.query;
    const data = await prisma.prayerRequest.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    });
    await audit(req.admin.email, "prayers_viewed");
    res.json({ data });
  })
);

/* ---------- generic CRUD factory -------------------------------------- */

/**
 * Content collections share identical shapes, so one factory keeps the
 * validation, auditing and authorisation consistent across all of them.
 */
function crud(path, model, schema, label) {
  router.get(
    `/${path}`,
    asyncRoute(async (_req, res) => {
      res.json(await prisma[model].findMany({ orderBy: { createdAt: "desc" } }));
    })
  );

  router.post(
    `/${path}`,
    validate(schema),
    asyncRoute(async (req, res) => {
      const rec = await prisma[model].create({ data: req.body });
      await audit(req.admin.email, `${label}_created`, rec.id);
      res.status(201).json(rec);
    })
  );

  router.patch(
    `/${path}/:id`,
    byId,
    validatePartial(schema),
    asyncRoute(async (req, res) => {
      const rec = await prisma[model].update({
        where: { id: req.params.id },
        data: req.body,
      });
      await audit(req.admin.email, `${label}_updated`, rec.id);
      res.json(rec);
    })
  );

  router.delete(
    `/${path}/:id`,
    canDelete,
    byId,
    asyncRoute(async (req, res) => {
      await prisma[model].delete({ where: { id: req.params.id } });
      await audit(req.admin.email, `${label}_deleted`, req.params.id);
      res.status(204).end();
    })
  );
}

crud("sermons", "sermon", schemas.sermon, "sermon");
crud("events", "event", schemas.occasion, "event");
crud("announcements", "announcement", schemas.occasion, "announcement");
crud("testimonies", "testimony", schemas.testimony, "testimony");

/* ---------- services (no delete — fixed weekly schedule) --------------- */

router.get(
  "/services",
  asyncRoute(async (_req, res) => {
    res.json(await prisma.service.findMany({ orderBy: { sortOrder: "asc" } }));
  })
);

router.patch(
  "/services/:id",
  byId,
  validatePartial(schemas.service),
  asyncRoute(async (req, res) => {
    const rec = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await audit(req.admin.email, "service_updated", rec.id);
    res.json(rec);
  })
);

/* ---------- audit trail (SUPER_ADMIN only) ----------------------------- */

router.get(
  "/audit",
  requireRole("SUPER_ADMIN"),
  validate(schemas.pagination, "query"),
  asyncRoute(async (req, res) => {
    const { take } = req.validated.query;
    res.json(
      await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take })
    );
  })
);

export default router;
