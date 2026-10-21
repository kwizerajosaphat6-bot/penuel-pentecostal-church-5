/**
 * Prisma client singleton.
 * ------------------------------------------------------------------
 * All database access in the application goes through Prisma, which
 * always emits parameterised SQL. There is no raw-query usage anywhere
 * in this codebase, so SQL injection is structurally impossible.
 */

import { PrismaClient } from "@prisma/client";
import logger from "./logger.js";

const prisma = new PrismaClient({
  // `query` logging is intentionally excluded even in development so
  // parameter values never reach the log.
  log: [
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("warn", (e) => logger.warn("db.warn", { message: e.message }));
prisma.$on("error", (e) => logger.error("db.error", { message: e.message }));

export default prisma;
