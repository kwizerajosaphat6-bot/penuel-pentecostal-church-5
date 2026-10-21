// Local in-browser database.
// --------------------------------------------------------
// A tiny IndexedDB wrapper that mirrors the server schema so the
// admin panel — and the database preview — work even when no
// backend is running. All data stays on this device only.

const DB_NAME = "penuel-local";
const DB_VERSION = 1;
const STORES = [
  "sermons",
  "events",
  "announcements",
  "testimonies",
  "services",
  "messages",
  "prayers",
  "news",
  "audit",
  "session",
] as const;
export type Store = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T = unknown>(
  store: Store,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => Promise<T>
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        let result: T;
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        Promise.resolve(fn(s)).then((v) => {
          result = v;
        });
      })
  );
}

function id(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ---------- generic helpers --------------------------------------

export async function listAll(store: Store): Promise<any[]> {
  return tx(store, "readonly", async (s) =>
    new Promise((resolve) => {
      const req = s.getAll();
      req.onsuccess = () => resolve(req.result);
    })
  );
}

export async function getOne(store: Store, id: string): Promise<any | null> {
  return tx(store, "readonly", (s) =>
    new Promise((res) => {
      const r = s.get(id);
      r.onsuccess = () => res(r.result ?? null);
    })
  );
}

export async function insert(store: Store, rec: any) {
  const item = { id: id(), createdAt: new Date().toISOString(), ...rec };
  await tx(store, "readwrite", (s) =>
    new Promise((res, rej) => {
      const r = s.add(item);
      r.onsuccess = () => res(item);
      r.onerror = () => rej(r.error);
    })
  );
  return item;
}

export async function update(store: Store, id: string, patch: any) {
  const existing = await getOne(store, id);
  if (!existing) return null;
  const merged = { ...existing, ...patch, id };
  await tx(store, "readwrite", (s) =>
    new Promise((res, rej) => {
      const r = s.put(merged);
      r.onsuccess = () => res(merged);
      r.onerror = () => rej(r.error);
    })
  );
  return merged;
}

export async function remove(store: Store, id: string) {
  await tx(store, "readwrite", (s) =>
    new Promise((res) => {
      const r = s.delete(id);
      r.onsuccess = () => res(null);
    })
  );
}

// ---------- convenience wrappers (used by admin pages) ----------

export const listSermons = () => listAll("sermons");
export const addSermon = (rec: any) => insert("sermons", rec);
export const updateSermon = (id: string, patch: any) => update("sermons", id, patch);
export const deleteSermon = (id: string) => remove("sermons", id);

export const listEvents = () => listAll("events");
export const addEvent = (rec: any) => insert("events", rec);
export const updateEvent = (id: string, patch: any) => update("events", id, patch);
export const deleteEvent = (id: string) => remove("events", id);

export const listAnnouncements = () => listAll("announcements");
export const addAnnouncement = (rec: any) => insert("announcements", rec);
export const updateAnnouncement = (id: string, patch: any) => update("announcements", id, patch);
export const deleteAnnouncement = (id: string) => remove("announcements", id);

export const listMessages = () => listAll("messages");
export const addMessage = (rec: any) => insert("messages", { ...rec, read: false });
export const markMessageRead = (id: string) => update("messages", id, { read: true });
export const deleteMessage = (id: string) => remove("messages", id);

export const listPrayers = () => listAll("prayers");
export const listTestimonies = () => listAll("testimonies");
export const listServices = () => listAll("services");
export const listNews = () => listAll("news");
export const listAudit = () => listAll("audit");

// ---------- demo seeding ----------------------------------------
// Fills empty tables with realistic sample records so the database
// preview has something to show on first visit.

export async function seedDemoIfEmpty() {
  const [sermons, events, announcements, testimonies, services, messages, prayers, news, audit] =
    await Promise.all([
      listAll("sermons"),
      listAll("events"),
      listAll("announcements"),
      listAll("testimonies"),
      listAll("services"),
      listAll("messages"),
      listAll("prayers"),
      listAll("news"),
      listAll("audit"),
    ]);

  if (sermons.length === 0) {
    await Promise.all([
      insert("sermons", { day: 22, month: "JUN", title: "Wrestling All Night", scripture: "Genesis 32:24–30", preacher: "Bishop Murindabigwi Ferdinand" }),
      insert("sermons", { day: 15, month: "JUN", title: "Filled, and Filled Again", scripture: "Acts 2:1–4, 38–41", preacher: "Penuel Pastoral Team" }),
      insert("sermons", { day: 8, month: "JUN", title: "What Enough Feels Like", scripture: "Psalm 23:1–6", preacher: "Penuel Pastoral Team" }),
    ]);
  }
  if (events.length === 0) {
    await Promise.all([
      insert("events", {
        day: "12",
        month: "JUL",
        title: "Annual Worship & Praise Night",
        type: "Upcoming Event",
        time: "18:00 – 21:00",
        detail: "Main church, Ruyenzi · All branches gathering for a night of praise and prayer.",
      }),
      insert("events", {
        day: "20",
        month: "JUL",
        title: "Community Outreach & Health Day",
        type: "Outreach Event",
        time: "09:00 – 15:00",
        detail: "Church grounds, Ruyenzi · Free health checkups, food parcel distribution, and prayer.",
      }),
    ]);
  }
  if (announcements.length === 0) {
    await Promise.all([
      insert("announcements", {
        day: "28",
        month: "JUL",
        title: "Youth Fire Fellowship & Camp Sign-up",
        type: "Announcement",
        time: "17:30 – 20:00",
        detail: "Ages 15–30 · Register after Sunday service at the welcome desk or youth hall.",
      }),
    ]);
  }
  if (testimonies.length === 0) {
    await Promise.all([
      insert("testimonies", {
        name: "NGIRIMANA Methode",
        role: "Received Jesus at Penuel",
        quote: "I came to Penuel carrying many questions about God. During prayer, I understood that Jesus was not far from me — He was calling me.",
      }),
      insert("testimonies", {
        name: "BATAMULIZA Jackline",
        role: "Member since 2011",
        quote: "I came here in 2011 owing money I couldn't talk about to anyone. What they did was sit with me every Wednesday until I could face it.",
      }),
    ]);
  }
  if (services.length === 0) {
    await Promise.all([
      insert("services", { day: "Sunday", time: "9:00 AM – 12:00 PM", name: "Main Worship Service", description: "Our main gathering for all Christians — worship, prayer, and the Word.", featured: true, sortOrder: 1 }),
      insert("services", { day: "Sunday", time: "2:00 PM – 5:00 PM", name: "Youth Time", description: "The afternoon belongs to the young people.", sortOrder: 2 }),
      insert("services", { day: "Saturday", time: "9:00 AM – 3:00 PM", name: "Revival Fasting Prayer", description: "A day set apart to seek God through fasting and prayer.", sortOrder: 3 }),
    ]);
  }
  if (messages.length === 0) {
    await Promise.all([
      insert("messages", { name: "Jane Nakato", email: "jane@example.com", subject: "Plan a visit", message: "Hello, my family is interested in visiting on Sunday. Could you tell me more about the children's program?", read: false }),
      insert("messages", { name: "David Okello", email: "david@example.com", subject: "Prayer request", message: "Please pray for my mother who is in hospital this week.", read: false }),
      insert("messages", { name: "Ruth Achieng", email: "ruth@example.com", subject: "Giving & stewardship", message: "How can I contribute to the school fees fund?", read: true }),
    ]);
  }
  if (prayers.length === 0) {
    await Promise.all([
      insert("prayers", { name: "Anonymous", email: "", message: "Please pray for my job interview on Thursday.", prayed: false }),
      insert("prayers", { name: "Joseph M.", email: "joseph@example.com", message: "Pray for peace in my home.", prayed: true }),
    ]);
  }
  if (news.length === 0) {
    await insert("news", {
      title: "Harvest Caravan 2024",
      summary: "Join us for the annual outreach trip next month.",
      body: "Details to follow.",
      published: true,
    });
  }
  if (audit.length === 0) {
    await insert("audit", { actor: "system", action: "seed_demo", target: null, details: "Demo data loaded for database preview." });
  }
}

// ---------- session (admin login) -------------------------------

export async function saveSession(session: any) {
  await tx("session", "readwrite", (s) =>
    new Promise((res, rej) => {
      const r = s.put({ id: "session", ...session });
      r.onsuccess = () => res(null);
      r.onerror = () => rej(r.error);
    })
  );
}

export async function loadSession(): Promise<any | null> {
  return tx("session", "readonly", (s) =>
    new Promise((res) => {
      const r = s.get("session");
      r.onsuccess = () => res(r.result ?? null);
    })
  );
}

export async function clearSession() {
  await tx("session", "readwrite", (s) =>
    new Promise((res) => {
      const r = s.delete("session");
      r.onsuccess = () => res(null);
    })
  );
}
