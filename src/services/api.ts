/**
 * API client.
 * ------------------------------------------------------------------
 * The only place in the frontend that talks to the backend.
 *
 * Security notes
 *  - No URL, key or credential is hard-coded. Both endpoints come from
 *    <meta> tags in index.html so the same bundle works in every
 *    environment.
 *  - The access token lives in memory for the lifetime of the page and
 *    is mirrored to sessionStorage (cleared when the tab closes) rather
 *    than localStorage (survives forever, larger XSS blast radius).
 *  - A 401 triggers exactly one silent refresh attempt, then a hard
 *    sign-out. There is no offline/demo bypass of any kind.
 */

interface Session {
  accessToken: string;
  admin: { name: string; email: string; role: string };
}

const SESSION_KEY = "penuel.session";
const REFRESH_KEY = "penuel.refresh";

/* ---------- endpoint discovery ------------------------------------- */

function meta(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const tag = document.querySelector(`meta[name="${name}"]`);
  const value = tag?.getAttribute("content")?.trim();
  return value || fallback;
}

const PUBLIC_API = () => meta("api-url", "http://127.0.0.1:4000/api");
const ADMIN_API = () => meta("admin-api-path", "http://127.0.0.1:4000/api/manage");

/* ---------- session storage ----------------------------------------- */

let memorySession: Session | null = null;

function readSession(): Session | null {
  if (memorySession) return memorySession;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    memorySession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    memorySession = null;
  }
  return memorySession;
}

function writeSession(session: Session | null, refreshToken?: string) {
  memorySession = session;
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
    if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
    if (!session) sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    /* storage disabled — in-memory session still works for this page */
  }
}

export function currentSession(): Session | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return Boolean(readSession()?.accessToken);
}

/* ---------- transport ------------------------------------------------ */

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function send(base: string, path: string, init: RequestInit, auth: boolean) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = readSession()?.accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    mode: "cors",
    credentials: "omit", // we use bearer tokens, not cookies
    referrerPolicy: "strict-origin-when-cross-origin",
  });
  return res;
}

/** Attempt a one-shot silent refresh. Returns true if a new token was set. */
async function tryRefresh(): Promise<boolean> {
  let refreshToken: string | null = null;
  try {
    refreshToken = sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return false;
  }
  if (!refreshToken) return false;

  const res = await send(
    ADMIN_API(),
    "/session/renew",
    { method: "POST", body: JSON.stringify({ refreshToken }) },
    false
  );
  if (!res.ok) return false;

  const data = await parse(res);
  const existing = readSession();
  if (!data?.accessToken || !existing) return false;

  writeSession({ ...existing, accessToken: data.accessToken }, data.refreshToken);
  return true;
}

async function request<T>(
  base: string,
  path: string,
  init: RequestInit = {},
  auth = true,
  retried = false
): Promise<T> {
  let res: Response;
  try {
    res = await send(base, path, init, auth);
  } catch {
    // Network / CORS / DNS failure — never expose the underlying reason.
    throw new ApiError(0, "Unable to reach the server. Please check your connection.");
  }

  if (res.status === 401 && auth && !retried) {
    if (await tryRefresh()) return request<T>(base, path, init, auth, true);
    writeSession(null);
    throw new ApiError(401, "Your session has ended. Please sign in again.");
  }

  if (!res.ok) {
    const body = await parse(res);
    throw new ApiError(res.status, body?.error || "Something went wrong. Please try again.");
  }

  return (await parse(res)) as T;
}

const admin = <T>(path: string, init?: RequestInit) => request<T>(ADMIN_API(), path, init, true);
const open = <T>(path: string, init?: RequestInit) => request<T>(PUBLIC_API(), path, init, false);

/* ---------- public surface -------------------------------------------- */

export const api = {
  /* -- authentication -- */
  async signIn(email: string, password: string) {
    const data = await request<{
      accessToken: string;
      refreshToken: string;
      admin: Session["admin"];
    }>(ADMIN_API(), "/session", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);

    writeSession({ accessToken: data.accessToken, admin: data.admin }, data.refreshToken);
    return data.admin;
  },

  async signOut() {
    try {
      await admin("/session/end", { method: "POST" });
    } catch {
      /* revoke server-side if possible; always clear locally */
    }
    writeSession(null);
  },

  /** Re-validates the stored token against the server. */
  async me() {
    const local = readSession();
    if (!local) return null;
    try {
      const data = await admin<{ admin: Session["admin"] }>("/session");
      writeSession({ ...local, admin: data.admin });
      return data.admin;
    } catch {
      writeSession(null);
      return null;
    }
  },

  /* -- dashboard -- */
  overview: () => admin<Record<string, number>>("/overview"),

  /* -- messages -- */
  messages: () => admin<{ data: any[] }>("/messages").then((r) => r.data),
  markMessageRead: (id: string) => admin(`/messages/${id}/read`, { method: "PATCH" }),
  toggleMessageRead: (id: string) => admin(`/messages/${id}/read/toggle`, { method: "PATCH" }),
  deleteMessage: (id: string) => admin(`/messages/${id}`, { method: "DELETE" }),
  starMessage: (id: string) => admin(`/messages/${id}/star`, { method: "PATCH" }),
  setMessageLabel: (id: string, label: string) =>
    admin(`/messages/${id}/label`, { method: "PATCH", body: JSON.stringify({ label }) }),

  /* -- sermons -- */
  sermons: () => admin<any[]>("/sermons"),
  addSermon: (d: unknown) => admin("/sermons", { method: "POST", body: JSON.stringify(d) }),
  updateSermon: (id: string, d: unknown) =>
    admin(`/sermons/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
  deleteSermon: (id: string) => admin(`/sermons/${id}`, { method: "DELETE" }),
  duplicateSermon: (id: string) => admin(`/sermons/${id}/duplicate`, { method: "POST" }),

  /* -- events -- */
  events: () => admin<any[]>("/events"),
  addEvent: (d: unknown) => admin("/events", { method: "POST", body: JSON.stringify(d) }),
  updateEvent: (id: string, d: unknown) =>
    admin(`/events/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
  deleteEvent: (id: string) => admin(`/events/${id}`, { method: "DELETE" }),
  duplicateEvent: (id: string) => admin(`/events/${id}/duplicate`, { method: "POST" }),

  /* -- announcements -- */
  announcements: () => admin<any[]>("/announcements"),
  addAnnouncement: (d: unknown) =>
    admin("/announcements", { method: "POST", body: JSON.stringify(d) }),
  updateAnnouncement: (id: string, d: unknown) =>
    admin(`/announcements/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
  deleteAnnouncement: (id: string) => admin(`/announcements/${id}`, { method: "DELETE" }),
  duplicateAnnouncement: (id: string) =>
    admin(`/announcements/${id}/duplicate`, { method: "POST" }),

  /* -- media -- */
  media: () => admin<any[]>("/media"),
  addMedia: (d: unknown) => admin("/media", { method: "POST", body: JSON.stringify(d) }),
  updateMedia: (id: string, d: unknown) =>
    admin(`/media/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
  deleteMedia: (id: string) => admin(`/media/${id}`, { method: "DELETE" }),
  duplicateMedia: (id: string) => admin(`/media/${id}/duplicate`, { method: "POST" }),

  /* -- audit -- */
  auditLog: () => admin<any[]>("/audit"),

  /* -- accounts -- */
  listAccounts: () => admin<any[]>("/accounts"),
  createAccount: (d: { name: string; email: string; password: string; role: string }) =>
    admin("/accounts", { method: "POST", body: JSON.stringify(d) }),
  removeAccount: (id: string) => admin(`/accounts/${id}`, { method: "DELETE" }),

  /* -- settings -- */
  getSettings: () => admin<any>("/settings"),
  updateSettings: (d: any) =>
    admin("/settings", { method: "PATCH", body: JSON.stringify(d) }),

  /* -- public reads (used by the website itself) -- */
  publicSermons: () => open<any[]>("/sermons"),
  publicOccasions: () => open<any[]>("/occasions"),
  publicTestimonies: () => open<any[]>("/testimonies"),
  publicServices: () => open<any[]>("/services"),

  /* -- public writes -- */
  sendContact: (payload: unknown) =>
    open<{ reference: string }>("/contact", { method: "POST", body: JSON.stringify(payload) }),
};

export { ApiError };
