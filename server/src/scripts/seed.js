/**
 * One-time database seeder.
 * ------------------------------------------------------------------
 * Creates the first administrator and the baseline public content.
 *
 * The admin password is NEVER hard-coded. It must be supplied at run
 * time and is discarded immediately after hashing:
 *
 *   SEED_ADMIN_EMAIL=you@example.org \
 *   SEED_ADMIN_PASSWORD='<a long random passphrase>' \
 *   npm run db:seed
 *
 * Re-running is safe: existing rows are left untouched.
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

const BCRYPT_ROUNDS = 12;

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[seed] ${name} must be set. Aborting.`);
    process.exit(1);
  }
  return value.trim();
}

function assertStrong(password) {
  const problems = [];
  if (password.length < 12) problems.push("at least 12 characters");
  if (!/[a-z]/.test(password)) problems.push("a lowercase letter");
  if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
  if (!/[0-9]/.test(password)) problems.push("a digit");
  if (problems.length) {
    console.error(`[seed] SEED_ADMIN_PASSWORD needs: ${problems.join(", ")}.`);
    process.exit(1);
  }
}

async function seed() {
  const email = requireEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  assertStrong(password);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log("[seed] administrator already exists — skipped.");
  } else {
    await prisma.admin.create({
      data: {
        email,
        name: process.env.SEED_ADMIN_NAME?.trim() || "Church Administrator",
        role: "SUPER_ADMIN",
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
    });
    console.log(`[seed] administrator created: ${email}`);
  }

  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        { day: "Sunday", time: "08:00", name: "Prayer & Bible Study", description: "A quiet start before the building fills up. We read a passage, talk about what it means, and pray.", sortOrder: 1 },
        { day: "Sunday", time: "10:00", name: "Main Service & Communion", description: "Singing, prayer, a sermon you can actually follow, and communion. Around ninety minutes.", featured: true, sortOrder: 2 },
        { day: "Wednesday", time: "19:00", name: "Midweek Prayer", description: "Bring whatever you are carrying. We pray with you, not just for you.", sortOrder: 3 },
        { day: "Friday", time: "19:30", name: "Youth Night", description: "The young people run this one themselves. Ages 15 to 30.", sortOrder: 4 },
      ],
    });
    console.log("[seed] services created");
  }

  if ((await prisma.sermon.count()) === 0) {
    await prisma.sermon.createMany({
      data: [
        { day: 22, month: "JUN", title: "Wrestling All Night", scripture: "Genesis 32:24–30", preacher: "Pastor Emmanuel Okafor" },
        { day: 15, month: "JUN", title: "Filled, and Filled Again", scripture: "Acts 2:1–4, 38–41", preacher: "Elder Daniel Kimaro" },
        { day: 8, month: "JUN", title: "What Enough Feels Like", scripture: "Psalm 23:1–6", preacher: "Pastor Grace Adeyemi" },
      ],
    });
    console.log("[seed] sermons created");
  }

  if ((await prisma.event.count()) === 0) {
    await prisma.event.createMany({
      data: [
        { day: "12", month: "JUL", title: "Annual Worship & Praise Night", time: "18:00 – 21:00", type: "Upcoming Event", detail: "Main Sanctuary · All congregations gathering for a night of praise and prayer." },
        { day: "20", month: "JUL", title: "Community Outreach & Health Day", time: "09:00 – 15:00", type: "Outreach Event", detail: "Grace Avenue Grounds · Free health checkups, food parcel distribution, and prayer." },
      ],
    });
    console.log("[seed] events created");
  }

  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.create({
      data: { day: "28", month: "JUL", title: "Youth Fire Fellowship & Camp Sign-up", time: "17:30 – 20:00", type: "Announcement", detail: "Ages 15–30 · Register after Sunday service at the welcome desk or youth hall." },
    });
    console.log("[seed] announcements created");
  }

  if ((await prisma.testimony.count()) === 0) {
    await prisma.testimony.createMany({
      data: [
        { name: "NGIRIMANA Methode", role: "Received Jesus at Penuel", quote: "I came to Penuel carrying many questions about God and about my own life. During prayer, I understood that Jesus was not far from me — He was calling me. I received Him that day, and since then I have been learning to walk with Him step by step." },
        { name: "BATAMULIZA Jackline", role: "Member since 2011", quote: "I came here in 2011 owing money I couldn't talk about to anyone. Nobody fixed it for me. What they did was sit with me every Wednesday until I could face it. That turned out to be the thing I actually needed." },
      ],
    });
    console.log("[seed] testimonies created");
  }

  console.log("[seed] complete.");
}

seed()
  .catch((err) => {
    console.error("[seed] failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
