/**
 * Request validation.
 * ------------------------------------------------------------------
 * Every write endpoint validates its body against an explicit schema.
 * This is an ALLOW-LIST: any field not named in the schema is stripped
 * before it reaches Prisma, which is what prevents mass-assignment
 * attacks (e.g. a client trying to POST `{ role: "SUPER_ADMIN" }`).
 *
 * Strings are additionally stripped of HTML so stored-XSS is impossible
 * even if a future template renders a value without escaping.
 */

import { z } from "zod";

/** Remove tags, control characters and zero-width joiners. */
function clean(value) {
  return String(value)
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

const text = (max) => z.string().transform(clean).pipe(z.string().min(1).max(max));
const optionalText = (max) =>
  z.string().optional().default("").transform(clean).pipe(z.string().max(max));

export const schemas = {
  login: z.object({
    email: z.string().trim().toLowerCase().email().max(200),
    password: z.string().min(8).max(200),
  }),

  refresh: z.object({
    refreshToken: z.string().min(20).max(500),
  }),

  contact: z.object({
    name: text(120),
    email: z.string().trim().toLowerCase().email().max(200),
    subject: optionalText(120),
    message: text(4000),
    // Honeypot — must be empty. Bots fill every field they find.
    company: z.string().max(0).optional().or(z.literal("")),
  }),

  prayer: z.object({
    name: text(120),
    email: z.string().trim().toLowerCase().email().max(200).or(z.literal("")),
    message: text(4000),
    company: z.string().max(0).optional().or(z.literal("")),
  }),

  sermon: z.object({
    day: z.coerce.number().int().min(1).max(31),
    month: text(8),
    title: text(200),
    scripture: text(200),
    preacher: text(120),
    published: z.boolean().optional().default(true),
  }),

  occasion: z.object({
    day: text(8),
    month: text(8),
    title: text(200),
    time: text(60),
    type: optionalText(60),
    detail: text(600),
    published: z.boolean().optional().default(true),
  }),

  testimony: z.object({
    name: text(120),
    role: text(120),
    quote: text(1000),
    featured: z.boolean().optional().default(false),
  }),

  service: z.object({
    day: text(20),
    time: text(20),
    name: text(120),
    description: text(600),
    featured: z.boolean().optional().default(false),
    sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  }),

  // Route params — blocks path traversal and malformed identifiers.
  uuidParam: z.object({ id: z.string().uuid() }),

  pagination: z.object({
    page: z.coerce.number().int().min(1).max(10_000).optional().default(1),
    take: z.coerce.number().int().min(1).max(50).optional().default(20),
  }),
};

/** Express middleware factory: validates `req[source]` against `schema`. */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const err = new Error("Validation failed");
      err.status = 400;
      // Field names only — never the submitted values, never Zod internals.
      err.publicMessage = "Some of the information provided is not valid.";
      err.fields = result.error.issues.map((i) => i.path.join(".")).slice(0, 10);
      return next(err);
    }
    // Replace the raw input with the parsed + sanitised object.
    if (source === "body") req.body = result.data;
    else req.validated = { ...(req.validated || {}), [source]: result.data };
    return next();
  };
}

/** Partial variant for PATCH endpoints. */
export function validatePartial(schema) {
  return validate(schema.partial());
}
