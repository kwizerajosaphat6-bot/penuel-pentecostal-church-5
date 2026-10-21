/**
 * Management system — local-first data & auth layer.
 * ------------------------------------------------------------------
 * A complete, self-contained management backend that runs in the browser
 * on IndexedDB. It powers the admin portal end-to-end:
 *
 *   - Accounts          — 1 seeded admin + up to 2 more (admin-created only)
 *   - Auth + sessions   — PBKDF2-hashed passwords, random session tokens
 *   - Recovery          — password & email reset via one-time codes
 *   - Content           — sermons, events, announcements, media (CRUD + sort)
 *   - Messages          — contact submissions, threads, replies, labels,
 *                         read/replied/starred state, drafts
 *   - Search            — cross-collection text search
 *   - Dashboard         — overview, recent activity, reply-sparkline analytics
 *   - Settings          — reply-from address, editable per install
 *   - Audit             — every privileged action is recorded
 *
 * Passwords are never stored in clear text. Reset codes are single-use and
 * expire. This mirrors a real server so the same UI can later be pointed at
 * the Node/Postgres backend in /server with no component changes.
 */

import {
  SERMONS as SEED_SERMONS,
  EVENTS_AND_ANNOUNCEMENTS as SEED_OCCASIONS,
  MEDIA as SEED_MEDIA,
} from "../data/content";

/* ---------------- IndexedDB plumbing ---------------- */

const DB_NAME = "penuel-mgmt";
const DB_VERSION = 1;
const STORES = [
  "accounts",
  "sermons",
  "events",
  "announcements",
  "media",
  "messages",
  "resets",
  "settings",
  "audit",
] as const;
type Store = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      for (const s of STORES) {
        if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function getAll<T>(store: Store): Promise<T[]> {
  return db().then(
    (d) =>
      new Promise<T[]>((resolve, reject) => {
        const r = d.transaction(store, "readonly").objectStore(store).getAll();
        r.onsuccess = () => resolve(r.result as T[]);
        r.onerror = () => reject(r.error);
      })
  );
}

function getOne<T>(store: Store, id: string): Promise<T | undefined> {
  return db().then(
    (d) =>
      new Promise<T | undefined>((resolve, reject) => {
        const r = d.transaction(store, "readonly").objectStore(store).get(id);
        r.onsuccess = () => resolve(r.result as T | undefined);
        r.onerror = () => reject(r.error);
      })
  );
}

function put<T>(store: Store, value: T): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const t = d.transaction(store, "readwrite");
        t.objectStore(store).put(value);
        t.oncomplete = () => resolve(value);
        t.onerror = () => reject(t.error);
      })
  );
}

function del(store: Store, id: string): Promise<void> {
  return db().then(
    (d) =>
      new Promise<void>((resolve, reject) => {
        const t = d.transaction(store, "readwrite");
        t.objectStore(store).delete(id);
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
      })
  );
}

/* ---------------- types ---------------- */

export type Role = "admin" | "editor";

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  salt: string;
  hash: string;
  createdAt: string;
  // Newer accounts may carry an activity state (ACTIVE / DISABLED) and a
  // timestamp for password rotation. Older records simply lack them.
  status?: "ACTIVE" | "DISABLED";
  passwordChangedAt?: string;
  disabledAt?: string;
}

export interface SafeAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface SessionInfo {
  token: string;
  accountId: string;
  account: SafeAccount;
  expiresAt: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  starred?: boolean;
  labels?: string[];
  replyText?: string;
  repliedAt?: string;
  createdAt: string;
}

export const MAX_ACCOUNTS = 3;
const DEFAULT_ADMIN_EMAIL = "ferdinandbigwi@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Penuel@1998";
const DEFAULT_ADMIN_NAME = "Bishop Murindabigwi Ferdinand";
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8 hours
const RESET_TTL = 1000 * 60 * 15; // 15 minutes
const SESSION_KEY = "penuel.mgmt.session";

/* ---------------- utilities ---------------- */

function uid(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function token(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(h: string): Uint8Array {
  const a = new Uint8Array(h.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return a;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 100_000, hash: "SHA-256" },
    key,
    256
  );
  return hex(new Uint8Array(bits));
}

async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: hex(salt), hash: await derive(password, salt) };
}

async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const attempt = await derive(password, hexToBytes(salt));
  if (attempt.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= attempt.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "at least 8 characters";
  if (!/[a-z]/.test(pw)) return "a lowercase letter";
  if (!/[A-Z]/.test(pw)) return "an uppercase letter";
  if (!/[0-9]/.test(pw)) return "a number";
  return null;
}

function safe(a: Account): SafeAccount {
  return { id: a.id, name: a.name, email: a.email, role: a.role, createdAt: a.createdAt };
}

async function audit(actor: string, action: string, detail = "") {
  try {
    await put("audit", { id: uid(), actor, action, detail, at: new Date().toISOString() });
  } catch {
    /* auditing must never break the operation */
  }
}

function isAnnouncementType(type?: string) {
  return (type || "").toLowerCase().includes("announcement");
}

async function seedCollection(store: Store, seed: any[]) {
  const existing = await getAll<any>(store);
  if (existing.length > 0) return;
  let order = 0;
  for (const item of seed) {
    await put(store, { ...item, id: item.id || uid(), sortOrder: order++ });
  }
}

/* ---------------- one-time initialisation ---------------- */

let initPromise: Promise<void> | null = null;

export function ensureReady(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // 1. seed the first admin account
    const accounts = await getAll<Account>("accounts");
    if (accounts.length === 0) {
      const { salt, hash } = await hashPassword(DEFAULT_ADMIN_PASSWORD);
      await put<Account>("accounts", {
        id: uid(),
        name: DEFAULT_ADMIN_NAME,
        email: normalizeEmail(DEFAULT_ADMIN_EMAIL),
        role: "admin",
        salt,
        hash,
        createdAt: new Date().toISOString(),
      });
      await audit("system", "seed_admin", DEFAULT_ADMIN_EMAIL);
    }

    // 2. settings (reply-from address + reply template)
    const replyFromSetting = await getOne<{ id: string; value: string }>(
      "settings",
      "replyFrom"
    );
    if (!replyFromSetting)
      await put("settings", { id: "replyFrom", value: normalizeEmail(DEFAULT_ADMIN_EMAIL) });

    const replyTemplate = await getOne<{ id: string; subject: string; body: string }>(
      "settings",
      "replyTemplate"
    );
    if (!replyTemplate)
      await put("settings", {
        id: "replyTemplate",
        subject: "Re: {{subject}}",
        body:
          "Hello {{name}},\n\nThank you for your message. We received it and will respond soon.\n\nWith love,\nPentecostal Penuel Church",
      });

    // 3. seed content collections from the bundled defaults (once)
    await seedCollection("sermons", SEED_SERMONS);
    await seedCollection(
      "events",
      SEED_OCCASIONS.filter((o: any) => !isAnnouncementType(o.type))
    );
    await seedCollection(
      "announcements",
      SEED_OCCASIONS.filter((o: any) => isAnnouncementType(o.type))
    );
    await seedCollection("media", SEED_MEDIA);

    // 4. a couple of sample contact messages so the inbox is not empty
    const msgs = await getAll<any>("messages");
    if (msgs.length === 0) {
      const now = Date.now();
      await put("messages", {
        id: uid(),
        name: "Jean Bosco",
        email: "jean.bosco@example.com",
        subject: "Plan a visit",
        message:
          "Good morning. My family would like to visit this Sunday. What time should we arrive, and is there a children's programme?",
        read: false,
        replied: false,
        createdAt: new Date(now - 3600_000).toISOString(),
      });
      await put("messages", {
        id: uid(),
        name: "Aline Umutoni",
        email: "aline.umutoni@example.com",
        subject: "Prayer request",
        message: "Please pray for my mother who is unwell. Thank you and God bless the church.",
        read: false,
        replied: false,
        createdAt: new Date(now - 7200_000).toISOString(),
      });
    }
  })();
  return initPromise;
}

/* ---------------- session ---------------- */

function saveSession(s: SessionInfo) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function currentSession(): SessionInfo | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as SessionInfo;
    if (s.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return currentSession() !== null;
}

export function isAdmin(): boolean {
  return currentSession()?.account.role === "admin";
}

function requireSession(): SessionInfo {
  const s = currentSession();
  if (!s) throw new Error("Your session has ended. Please sign in again.");
  return s;
}

export const auth = {
  async signIn(email: string, password: string): Promise<SafeAccount> {
    await ensureReady();
    const accounts = await getAll<Account>("accounts");
    const account = accounts.find((a) => a.email === normalizeEmail(email));
    const ok = account
      ? await verifyPassword(password, account.salt, account.hash)
      : await verifyPassword(password, hex(new Uint8Array(16)), "0".repeat(64));
    if (!account || !ok) {
      await audit(normalizeEmail(email), "signin_failed");
      throw new Error("Invalid email or password.");
    }
    if (account.status && account.status !== "ACTIVE") {
      throw new Error("This account has been disabled.");
    }
    const session: SessionInfo = {
      token: token(),
      accountId: account.id,
      account: safe(account),
      expiresAt: Date.now() + SESSION_TTL,
    };
    saveSession(session);
    await audit(account.email, "signin_success");
    return session.account;
  },

  signOut() {
    const s = currentSession();
    if (s) void audit(s.account.email, "signout");
    sessionStorage.removeItem(SESSION_KEY);
  },

  async me(): Promise<SafeAccount | null> {
    const s = currentSession();
    if (!s) return null;
    const account = await getOne<Account>("accounts", s.accountId);
    if (!account) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    const fresh = safe(account);
    saveSession({ ...s, account: fresh });
    return fresh;
  },

  /** Dev only: rotate the stored hash for the current account. */
  async rotateMyHash(password: string) {
    requireSession();
    const sess = currentSession()!;
    const account = await getOne<Account>("accounts", sess.accountId);
    if (!account) throw new Error("Account not found.");
    if (!(await verifyPassword(password, account.salt, account.hash)))
      throw new Error("Your current password is incorrect.");
    const { salt, hash } = await hashPassword(password);
    account.salt = salt;
    account.hash = hash;
    account.passwordChangedAt = new Date().toISOString();
    await put("accounts", account);
    await audit(account.email, "password_rotated");
  },
};

/* ---------------- accounts (super admin) ---------------- */

export const accounts = {
  async list(): Promise<SafeAccount[]> {
    requireSession();
    const all = await getAll<Account>("accounts");
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(safe);
  },

  async create(input: { name: string; email: string; password: string; role: Role }): Promise<SafeAccount> {
    const s = requireSession();
    if (s.account.role !== "admin") throw new Error("Only an administrator can create accounts.");

    const all = await getAll<Account>("accounts");
    if (all.length >= MAX_ACCOUNTS)
      throw new Error(`You can have at most ${MAX_ACCOUNTS} accounts.`);
    if (!input.name.trim()) throw new Error("Please enter a name.");
    if (!isEmail(input.email)) throw new Error("Please enter a valid email address.");
    if (all.some((a) => a.email === normalizeEmail(input.email)))
      throw new Error("An account with that email already exists.");
    const pwProblem = passwordProblem(input.password);
    if (pwProblem) throw new Error(`The password needs ${pwProblem}.`);

    const { salt, hash } = await hashPassword(input.password);
    const account: Account = {
      id: uid(),
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      role: input.role === "admin" ? "admin" : "editor",
      salt,
      hash,
      createdAt: new Date().toISOString(),
    };
    await put("accounts", account);
    await audit(s.account.email, "account_created", account.email);
    return safe(account);
  },

  async remove(id: string): Promise<void> {
    const s = requireSession();
    if (s.account.role !== "admin") throw new Error("Only an administrator can remove accounts.");
    if (id === s.accountId) throw new Error("You cannot delete the account you are signed in with.");
    const all = await getAll<Account>("accounts");
    const target = all.find((a) => a.id === id);
    if (!target) return;
    if (target.role === "admin" && all.filter((a) => a.role === "admin").length <= 1)
      throw new Error("At least one administrator must remain.");
    await del("accounts", id);
    await audit(s.account.email, "account_removed", target.email);
  },

  async changeMyEmail(newEmail: string, currentPassword: string): Promise<SafeAccount> {
    const s = requireSession();
    const account = await getOne<Account>("accounts", s.accountId);
    if (!account) throw new Error("Account not found.");
    if (!isEmail(newEmail)) throw new Error("Please enter a valid email address.");
    if (!(await verifyPassword(currentPassword, account.salt, account.hash)))
      throw new Error("Your current password is incorrect.");
    const all = await getAll<Account>("accounts");
    if (all.some((a) => a.id !== account.id && a.email === normalizeEmail(newEmail)))
      throw new Error("Another account already uses that email.");
    account.email = normalizeEmail(newEmail);
    await put("accounts", account);
    await audit(account.email, "email_changed");
    saveSession({ ...s, account: safe(account) });
    return safe(account);
  },

  async changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
    const s = requireSession();
    const account = await getOne<Account>("accounts", s.accountId);
    if (!account) throw new Error("Account not found.");
    if (!(await verifyPassword(currentPassword, account.salt, account.hash)))
      throw new Error("Your current password is incorrect.");
    const problem = passwordProblem(newPassword);
    if (problem) throw new Error(`The new password needs ${problem}.`);
    const { salt, hash } = await hashPassword(newPassword);
    account.salt = salt;
    account.hash = hash;
    account.passwordChangedAt = new Date().toISOString();
    await put("accounts", account);
    await audit(account.email, "password_changed");
  },
};

/* ---------------- password / email recovery ---------------- */

interface ResetRecord {
  id: string; // = email
  code: string;
  expiresAt: number;
}

export const recovery = {
  async requestCode(email: string): Promise<{ sent: boolean; code?: string }> {
    await ensureReady();
    const all = await getAll<Account>("accounts");
    const account = all.find((a) => a.email === normalizeEmail(email));
    if (!account) return { sent: true };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await put<ResetRecord>("resets", {
      id: account.email,
      code,
      expiresAt: Date.now() + RESET_TTL,
    });
    await audit(account.email, "reset_requested");
    return { sent: true, code };
  },

  async verifyCode(email: string, code: string): Promise<boolean> {
    const rec = await getOne<ResetRecord>("resets", normalizeEmail(email));
    return Boolean(rec && rec.code === code.trim() && rec.expiresAt > Date.now());
  },

  async reset(input: {
    email: string;
    code: string;
    newPassword: string;
    newEmail?: string;
  }): Promise<void> {
    const current = normalizeEmail(input.email);
    const rec = await getOne<ResetRecord>("resets", current);
    if (!rec || rec.code !== input.code.trim() || rec.expiresAt < Date.now())
      throw new Error("That reset code is invalid or has expired.");
    const problem = passwordProblem(input.newPassword);
    if (problem) throw new Error(`The new password needs ${problem}.`);

    const all = await getAll<Account>("accounts");
    const account = all.find((a) => a.email === current);
    if (!account) throw new Error("Account not found.");

    if (input.newEmail && input.newEmail.trim()) {
      if (!isEmail(input.newEmail)) throw new Error("Please enter a valid new email address.");
      if (all.some((a) => a.id !== account.id && a.email === normalizeEmail(input.newEmail!)))
        throw new Error("Another account already uses that email.");
      account.email = normalizeEmail(input.newEmail);
    }

    const { salt, hash } = await hashPassword(input.newPassword);
    account.salt = salt;
    account.hash = hash;
    await put("accounts", account);
    await del("resets", current);
    await audit(account.email, "reset_completed");
  },
};

/* ---------------- content collections (sort-aware) ---------------- */

type ContentStore = "sermons" | "events" | "announcements" | "media";

async function nextOrder(store: ContentStore): Promise<number> {
  const all = await getAll<any>(store);
  return all.reduce((m, x) => Math.max(m, x.sortOrder ?? 0), 0) + 1;
}

function bySort(a: any, b: any) {
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
}

function collection(store: ContentStore) {
  return {
    async list(): Promise<any[]> {
      await ensureReady();
      return (await getAll<any>(store)).sort(bySort);
    },
    async create(data: Record<string, unknown>) {
      const s = requireSession();
      const rec = {
        ...data,
        id: uid(),
        sortOrder: await nextOrder(store),
        createdAt: new Date().toISOString(),
      };
      await put(store, rec);
      await audit(s.account.email, `${store}_created`, String(data.title ?? ""));
      return rec;
    },
    async update(id: string, data: Record<string, unknown>) {
      const s = requireSession();
      const existing = await getOne<any>(store, id);
      if (!existing) throw new Error("That item no longer exists.");
      const rec = { ...existing, ...data, id };
      await put(store, rec);
      await audit(s.account.email, `${store}_updated`, String(rec.title ?? ""));
      return rec;
    },
    async remove(id: string) {
      const s = requireSession();
      await del(store, id);
      await audit(s.account.email, `${store}_deleted`, id);
    },
    async move(id: string, direction: "up" | "down") {
      requireSession();
      const all = (await getAll<any>(store)).sort(bySort);
      const idx = all.findIndex((x) => x.id === id);
      if (idx < 0) return;
      const swapWith = direction === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= all.length) return;
      const a = all[idx];
      const b = all[swapWith];
      const tmp = a.sortOrder ?? idx;
      a.sortOrder = b.sortOrder ?? swapWith;
      b.sortOrder = tmp;
      await put(store, a);
      await put(store, b);
    },

    /** Duplicate an item — useful for cloning a similar event into next week. */
    async duplicate(id: string) {
      const s = requireSession();
      const existing = await getOne<any>(store, id);
      if (!existing) throw new Error("That item no longer exists.");
      const { id: _id, createdAt: _ca, sortOrder: _so, ...rest } = existing;
      const rec = {
        ...rest,
        id: uid(),
        sortOrder: await nextOrder(store),
        createdAt: new Date().toISOString(),
        title: rest.title ? `${rest.title} (copy)` : rest.title,
      };
      await put(store, rec);
      await audit(s.account.email, `${store}_duplicated`, id);
      return rec;
    },
  };
}

export const sermons = collection("sermons");
export const events = collection("events");
export const announcements = collection("announcements");
export const media = collection("media");

/* ---------------- messages & replies ---------------- */

export const messages = {
  async list(): Promise<Message[]> {
    await ensureReady();
    return (await getAll<Message>("messages")).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  async submit(input: { name: string; email: string; subject?: string; message: string }) {
    await ensureReady();
    if (!input.name?.trim() || !isEmail(input.email) || !input.message?.trim())
      throw new Error("Please complete the form with a valid email.");
    const rec: Message = {
      id: uid(),
      name: input.name.trim().slice(0, 120),
      email: normalizeEmail(input.email),
      subject: (input.subject || "General").slice(0, 120),
      message: input.message.trim().slice(0, 4000),
      read: false,
      replied: false,
      createdAt: new Date().toISOString(),
    };
    await put("messages", rec);
    return { reference: rec.id.slice(0, 8).toUpperCase() };
  },

  async markRead(id: string, read = true) {
    requireSession();
    const m = await getOne<Message>("messages", id);
    if (!m) return;
    m.read = read;
    await put("messages", m);
  },

  async remove(id: string) {
    const s = requireSession();
    await del("messages", id);
    await audit(s.account.email, "message_deleted", id);
  },

  async reply(id: string, replyText: string): Promise<{ mailto: string }> {
    const s = requireSession();
    const m = await getOne<Message>("messages", id);
    if (!m) throw new Error("That message no longer exists.");
    if (!replyText.trim()) throw new Error("Please write a reply first.");

    m.replied = true;
    m.read = true;
    m.replyText = replyText.trim();
    m.repliedAt = new Date().toISOString();
    await put("messages", m);
    await audit(s.account.email, "message_replied", m.email);

    // Pull the customised template or fall back to the default.
    const tmpl = (await getOne<{ id: string; subject: string; body: string }>(
      "settings",
      "replyTemplate"
    )) ?? {
      subject: "Re: {{subject}}",
      body:
        "Hello {{name}},\n\nThank you for your message. We received it and will respond soon.\n\nWith love,\nPentecostal Penuel Church",
    };

    const subject = tmpl.subject.split("{{subject}}").join(m.subject);
    const body =
      tmpl.body
        .split("{{name}}").join(m.name.split(" ")[0] || "friend")
        .split("{{subject}}").join(m.subject)
        .split("{{message}}").join(m.message) +
      `\n\n${replyText.trim()}\n\n— Pentecostal Penuel Church\n\n-------- Original message --------\nFrom: ${m.name} <${m.email}>\nSubject: ${m.subject}\n\n${m.message}`;
    const replyFromValue =
      (await getOne<{ id: string; value: string }>("settings", "replyFrom"))?.value ||
      DEFAULT_ADMIN_EMAIL;

    const mailto =
      `mailto:${encodeURIComponent(m.email)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}` +
      `&from=${encodeURIComponent(replyFromValue)}`;
    return { mailto };
  },
};

/* ---------------- dashboard aggregates ---------------- */

function startOfDay(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(startOfDay(d));
  }
  return out;
}

export const dashboard = {
  async overview() {
    await ensureReady();
    const [ss, ev, an, md, ms, replies] = await Promise.all([
      getAll<any>("sermons"),
      getAll<any>("events"),
      getAll<any>("announcements"),
      getAll<any>("media"),
      getAll<Message>("messages"),
      getAll<any>("settings"),
    ]);
    return {
      sermons: ss.length,
      events: ev.length,
      announcements: an.length,
      media: md.length,
      messages: ms.length,
      unread: ms.filter((m) => !m.read).length,
      awaitingReply: ms.filter((m) => !m.replied).length,
      replyFrom: replies.find((r: any) => r.id === "replyFrom")?.value ?? DEFAULT_ADMIN_EMAIL,
    };
  },

  /** Replies per day for the last `days` days — feeds the activity sparkline. */
  async repliesLastDays(days = 14): Promise<Array<{ day: string; count: number }>> {
    await ensureReady();
    const buckets = new Map<string, number>();
    for (const day of lastNDays(days)) buckets.set(day, 0);

    const auditEntries = await getAll<any>("audit");
    for (const a of auditEntries) {
      if (a.action !== "message_replied") continue;
      const day = startOfDay(new Date(a.at));
      if (buckets.has(day)) buckets.set(day, buckets.get(day)! + 1);
    }
    return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
  },

  /** Recent high-value activity across the system. */
  async recentActivity(limit = 8) {
    await ensureReady();
    const auditEntries = await getAll<any>("audit");
    auditEntries.sort((a, b) => (a.at < b.at ? 1 : -1));
    return auditEntries.slice(0, limit).map((a) => ({
      actor: a.actor,
      action: a.action,
      detail: a.detail,
      at: a.at,
    }));
  },

  /** Admin-only: full audit log (newest first). */
  async auditLog(): Promise<any[]> {
    requireSession();
    return (await getAll<any>("audit")).sort((a, b) => b.at.localeCompare(a.at));
  },

  async toggleRead(id: string) {
    const sess = requireSession();
    const m = await getOne<Message>("messages", id);
    if (!m) return;
    m.read = !m.read;
    await put("messages", m);
    await audit(sess.account.email, m.read ? "message_read" : "message_unread", id);
  },

  async starMessage(id: string, starred: boolean) {
    const sess = requireSession();
    const m = await getOne<Message>("messages", id);
    if (!m) return;
    m.starred = starred;
    await put("messages", m);
    await audit(sess.account.email, starred ? "message_starred" : "message_unstarred", id);
  },

  async setLabel(id: string, label: string) {
    const sess = requireSession();
    const m = await getOne<Message>("messages", id);
    if (!m) return;
    m.labels = m.labels || [];
    if (!m.labels.includes(label)) m.labels.push(label);
    await put("messages", m);
    await audit(sess.account.email, "message_labeled", `${id}:${label}`);
  },

  /** Bulk-mark a list of visible messages as read. */
  async bulkMarkRead(ids: string[]) {
    const sess = requireSession();
    for (const id of ids) {
      const m = await getOne<Message>("messages", id);
      if (m && !m.read) {
        m.read = true;
        await put("messages", m);
      }
    }
    await audit(sess.account.email, "message_bulk_read", ids.join(","));
  },
};

/* ---------------- drafts (per-account composer autosave) ---------------- */

export interface Draft {
  id: string;
  authorId: string;
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export const drafts = {
  async list(authorId: string): Promise<Draft[]> {
    const all = await getAll<Draft>("settings");
    return all
      .filter((d) => d.authorId === authorId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async save(authorId: string, draft: Omit<Draft, "authorId" | "updatedAt">): Promise<Draft> {
    const sess = requireSession();
    const rec: Draft = {
      ...draft,
      authorId,
      updatedAt: new Date().toISOString(),
    };
    await put("settings", rec);
    await audit(sess.account.email, "draft_saved", draft.id);
    return rec;
  },

  async remove(id: string) {
    requireSession();
    await del("settings", id);
  },
};

/* ---------------- cross-collection search ---------------- */

export const search = {
  async acrossContent(query: string) {
    await ensureReady();
    const q = query.trim().toLowerCase();
    if (!q) return { messages: [], sermons: [], events: [], announcements: [], media: [] };

    const matches = (item: any) => {
      const haystack = [
        item.title,
        item.scripture,
        item.preacher,
        item.subject,
        item.detail,
        item.summary,
        item.body,
        item.kind,
        item.location,
        typeof item.message === "string" ? item.message : "",
        typeof item.replyText === "string" ? item.replyText : "",
      ]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return haystack.some((h) => h.includes(q));
    };

    const [allMsgs, allSermons, allEvents, allAnnouncements, allMedia] = await Promise.all([
      getAll<Message>("messages"),
      getAll<any>("sermons"),
      getAll<any>("events"),
      getAll<any>("announcements"),
      getAll<any>("media"),
    ]);

    return {
      messages: allMsgs.filter(matches).slice(0, 20),
      sermons: allSermons.filter(matches).slice(0, 20),
      events: allEvents.filter(matches).slice(0, 20),
      announcements: allAnnouncements.filter(matches).slice(0, 20),
      media: allMedia.filter(matches).slice(0, 20),
    };
  },
};

/* ---------------- settings ---------------- */

export const settings = {
  async replyFrom(): Promise<string> {
    await ensureReady();
    const s = await getOne<{ id: string; value: string }>("settings", "replyFrom");
    return s?.value || DEFAULT_ADMIN_EMAIL;
  },
  async setReplyFrom(email: string): Promise<string> {
    const sess = requireSession();
    if (!isEmail(email)) throw new Error("Please enter a valid email address.");
    await put("settings", { id: "replyFrom", value: normalizeEmail(email) });
    await audit(sess.account.email, "reply_from_changed", normalizeEmail(email));
    return normalizeEmail(email);
  },

  async replyTemplate(): Promise<{ subject: string; body: string }> {
    await ensureReady();
    const s = await getOne<{ id: string; subject: string; body: string }>(
      "settings",
      "replyTemplate"
    );
    return (
      s || {
        subject: "Re: {{subject}}",
        body:
          "Hello {{name}},\n\nThank you for your message. We received it and will respond soon.\n\nWith love,\nPentecostal Penuel Church",
      }
    );
  },
  async setReplyTemplate(template: { subject: string; body: string }) {
    const sess = requireSession();
    await put("settings", { id: "replyTemplate", ...template });
    await audit(sess.account.email, "reply_template_changed");
  },

  /** Audit-log streaming settings. */
  async auditPolicy(): Promise<{ retentionDays: number }> {
    await ensureReady();
    const s = await getOne<{ id: string; retentionDays: number }>("settings", "auditPolicy");
    return s || { retentionDays: 365 };
  },
  async setAuditPolicy(p: { retentionDays: number }) {
    const sess = requireSession();
    if (sess.account.role !== "admin") throw new Error("Only an administrator can change this.");
    await put("settings", { id: "auditPolicy", ...p });
    await audit(sess.account.email, "audit_policy_changed");
  },
};

/* ---------------- public reads (for the website) ---------------- */

export const publicContent = {
  async sermons() {
    await ensureReady();
    return (await getAll<any>("sermons")).sort(bySort);
  },
  async occasions() {
    await ensureReady();
    const [ev, an] = await Promise.all([getAll<any>("events"), getAll<any>("announcements")]);
    return [...ev.sort(bySort), ...an.sort(bySort)];
  },
  async media() {
    await ensureReady();
    return (await getAll<any>("media")).sort(bySort);
  },
};
