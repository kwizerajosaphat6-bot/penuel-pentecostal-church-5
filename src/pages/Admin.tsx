import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Icon, LogoMark } from "../components/Icons";
import { navigate, ROUTES } from "../lib/router";
import {
  auth,
  accounts as accountsApi,
  sermons as sermonsApi,
  events as eventsApi,
  announcements as announcementsApi,
  media as mediaApi,
  messages as messagesApi,
  settings as settingsApi,
  dashboard as dashboardApi,
  search as searchApi,
  passwordProblem,
  MAX_ACCOUNTS,
  type SafeAccount,
  type Message,
} from "../services/management";

type Tab =
  | "dashboard"
  | "messages"
  | "sermons"
  | "events"
  | "announcements"
  | "media"
  | "search"
  | "activity"
  | "accounts"
  | "settings";

const IMAGE_OPTIONS = [
  { value: "heroWorship", label: "Worship" },
  { value: "community", label: "Community / outreach" },
  { value: "churchBuilding", label: "Church building" },
  { value: "pastor", label: "Portrait" },
];

/* ---------- small shared UI primitives ---------- */

function Field({
  label,
  hint,
  optional = false,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-stone">
          {label}
        </span>
        {optional && (
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-stone/60">
            Optional
          </span>
        )}
      </div>
      {children}
      {hint && <span className="mt-1 block text-[0.68rem] leading-snug text-stone/80">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full border border-ink/20 bg-parchment px-3 py-2 text-sm text-ink focus:border-gold-deep focus:outline-none";

function Banner({
  tone,
  children,
}: {
  tone: "ok" | "err" | "info";
  children: ReactNode;
}) {
  const styles =
    tone === "ok"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
      : tone === "err"
      ? "border-rose-400 bg-rose-50 text-rose-900"
      : "border-ink/15 bg-parchment-2 text-stone";
  const icon =
    tone === "ok" ? "check" : tone === "err" ? "shield" : "book";
  return (
    <p
      role={tone === "ok" ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 border px-4 py-2.5 text-sm",
        styles
      )}
    >
      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "my-8 w-full border border-ink/15 bg-parchment-2 shadow-2xl",
          wide ? "max-w-2xl" : "max-w-lg"
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-4">
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-stone transition-colors hover:text-ink"
          >
            <Icon name="plus" className="h-5 w-5 rotate-45" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- content collection editor (CRUD + drag-to-reorder + duplicate) ---------- */

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "paragraphs" | "select" | "date" | "time" | "datetime";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
};

interface CollectionConfig {
  title: string;
  api: {
    list: () => Promise<any[]>;
    create: (d: Record<string, unknown>) => Promise<any>;
    update: (id: string, d: Record<string, unknown>) => Promise<any>;
    remove: (id: string) => Promise<void>;
    move: (id: string, dir: "up" | "down") => Promise<void>;
    duplicate?: (id: string) => Promise<any>;
  };
  fields: FieldDef[];
  primary: (item: any) => string;
  secondary: (item: any) => string;
}

function CollectionManager({ config }: { config: CollectionConfig }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setItems(await config.api.list());
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
  }, []);

  function openCreate() {
    const blank: Record<string, string> = {};
    for (const f of config.fields) blank[f.key] = f.type === "select" ? f.options?.[0]?.value ?? "" : "";
    setForm(blank);
    setCreating(true);
    setEditing(null);
    setError("");
  }

  function openEdit(item: any) {
    const filled: Record<string, string> = {};
    for (const f of config.fields) {
      let v = item[f.key];
      // Backward-compatible fallback for dates/times on legacy records
      if (f.key === "startDate" && !v) {
        if (item.createdAt) {
          const d = new Date(item.createdAt);
          if (!isNaN(d.getTime())) v = d.toISOString().slice(0, 10);
        }
      }
      if (f.key === "startTime" && !v && item.time) {
        const match = String(item.time).match(/\b(\d{1,2}:\d{2})\b/);
        if (match) v = match[1];
      }
      filled[f.key] = f.type === "paragraphs" && Array.isArray(v) ? v.join("\n\n") : v ?? "";
    }
    setForm(filled);
    setEditing(item);
    setCreating(false);
    setError("");
  }

  function close() {
    setCreating(false);
    setEditing(null);
    setError("");
  }

  function payload(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = (form[f.key] ?? "").trim();
      out[f.key] = f.type === "paragraphs" ? raw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) : raw;
    }

    // Automatically derive day & month from startDate for card headers
    if (out.startDate && typeof out.startDate === "string") {
      const parsed = new Date(`${out.startDate}T00:00:00`);
      if (!isNaN(parsed.getTime())) {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        out.day = String(parsed.getDate()).padStart(2, "0");
        out.month = monthNames[parsed.getMonth()];
        out.date = `${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
      }
    }

    // Format time display string automatically from start/end
    if (out.startTime) {
      const start = String(out.startTime);
      const end = out.endTime ? ` – ${out.endTime}` : "";
      const endDateLabel = out.endDate && out.endDate !== out.startDate ? ` (until ${out.endDate})` : "";
      out.time = `${start}${end}${endDateLabel}`;
    }

    return out;
  }

  async function save() {
    setError("");
    for (const f of config.fields) {
      if (f.required && !(form[f.key] ?? "").trim()) {
        setError(`${f.label} is required.`);
        return;
      }
    }
    setSaving(true);
    try {
      if (editing) await config.api.update(editing.id, payload());
      else await config.api.create(payload());
      close();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: any) {
    if (!confirm(`Delete "${config.primary(item)}"? This cannot be undone.`)) return;
    await config.api.remove(item.id);
    await refresh();
  }

  async function move(item: any, dir: "up" | "down") {
    await config.api.move(item.id, dir);
    await refresh();
  }

  async function duplicate(item: any) {
    if (!config.api.duplicate) return;
    await config.api.duplicate(item.id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone">
          {loading ? "Loading…" : `${items.length} item${items.length === 1 ? "" : "s"}`}
        </p>
        <button onClick={openCreate} className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80">
          <Icon name="plus" className="mr-1.5 inline h-3.5 w-3.5" /> Add new
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border border-ink/15 bg-parchment px-4 py-3 transition-colors hover:border-gold-deep/40"
          >
            <div className="flex flex-col">
              <button
                onClick={() => move(item, "up")}
                disabled={i === 0}
                aria-label="Move up"
                className="text-stone hover:text-gold-deep disabled:opacity-25"
              >
                <Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" />
              </button>
              <button
                onClick={() => move(item, "down")}
                disabled={i === items.length - 1}
                aria-label="Move down"
                className="text-stone hover:text-gold-deep disabled:opacity-25"
              >
                <Icon name="arrow" className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-ink">{config.primary(item)}</p>
              <p className="truncate text-xs text-stone">{config.secondary(item)}</p>
            </div>
            <button
              onClick={() => duplicate(item)}
              disabled={!config.api.duplicate}
              className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-stone hover:text-ink disabled:opacity-30"
            >
              Duplicate
            </button>
            <button
              onClick={() => openEdit(item)}
              className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-stone hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={() => remove(item)}
              className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-rose-700 hover:text-rose-900"
            >
              Delete
            </button>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="border border-dashed border-ink/20 bg-parchment px-4 py-10 text-center text-sm text-stone">
            Nothing here yet. Click "Add new" to create the first one.
          </p>
        )}
      </div>

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${config.title}` : `New ${config.title}`} onClose={close} wide>
          <div className="space-y-4">
            {error && <Banner tone="err">{error}</Banner>}
            {config.fields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint} optional={!f.required}>
                {f.type === "textarea" || f.type === "paragraphs" ? (
                  <textarea
                    rows={f.type === "paragraphs" ? 5 : 3}
                    value={form[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                ) : f.type === "select" ? (
                  <select
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputCls}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                ) : f.type === "time" ? (
                  <input
                    type="time"
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                )}
              </Field>
            ))}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={close} className="border border-ink/20 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-parchment">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- messages: inbox + filters + bulk + labels ---------- */

const MESSAGE_LABELS = ["vip", "follow-up", "prayer", "urgent", "pastoral"];

function MessagesManager() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "awaiting" | "starred">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [labelTarget, setLabelTarget] = useState<Message | null>(null);
  const [search, setSearch] = useState("");

  async function refresh() {
    setLoading(true);
    setItems(await messagesApi.list());
    setLoading(false);
  }
  useEffect(() => {
    void refresh();
  }, []);

  const shown = useMemo(() => {
    let r = items;
    switch (filter) {
      case "unread":
        r = r.filter((m) => !m.read);
        break;
      case "awaiting":
        r = r.filter((m) => !m.replied);
        break;
      case "starred":
        r = r.filter((m) => m.starred);
        break;
    }
    const q = search.trim().toLowerCase();
    if (q)
      r = r.filter((m) =>
        [m.name, m.email, m.subject, m.message, m.replyText]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(q))
      );
    return r;
  }, [items, filter, search]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openReply(m: Message) {
    setReplyTo(m);
    setReplyText(
      `Dear ${m.name.split(" ")[0] || "friend"},\n\nThank you for reaching out to Pentecostal Penuel Church. We received your message and will respond soon.\n\n`
    );
    setNote("");
  }

  async function sendReply() {
    if (!replyTo) return;
    setBusy(true);
    setNote("");
    try {
      const { mailto } = await messagesApi.reply(replyTo.id, replyText);
      window.open(mailto, "_blank");
      setReplyTo(null);
      await refresh();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not prepare the reply.");
    } finally {
      setBusy(false);
    }
  }

  async function bulkMarkRead() {
    if (selected.size === 0) return;
    await dashboardApi.bulkMarkRead(Array.from(selected));
    setSelected(new Set());
    await refresh();
  }

  async function setLabel(m: Message, label: string) {
    await dashboardApi.setLabel(m.id, label);
    setLabelTarget(null);
    await refresh();
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-ink/10 bg-parchment-2 p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages…"
          className="border border-ink/20 bg-parchment px-3 py-1.5 text-sm focus:border-gold-deep focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "unread", "awaiting", "starred"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "border px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] transition-colors",
                filter === f
                  ? "border-ink bg-ink text-parchment"
                  : "border-ink/20 bg-parchment text-stone hover:border-ink/60 hover:text-ink"
              )}
            >
              {f === "all" ? "All" : f === "unread" ? "Unread" : f === "awaiting" ? "Awaiting" : "Starred"}
            </button>
          ))}
          {selected.size > 0 && (
            <button
              onClick={bulkMarkRead}
              className="border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-emerald-800 hover:border-emerald-500"
            >
              Mark {selected.size} as read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {shown.map((m) => {
          const isSelected = selected.has(m.id);
          return (
            <article
              key={m.id}
              className={cn(
                "border bg-parchment p-4 transition-colors",
                m.read ? "border-ink/15" : "border-amber-300 bg-amber-50/40"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <label className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(m.id)}
                      className="h-4 w-4 accent-ink"
                    />
                  </label>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-ink">{m.name}</span>
                      {m.starred && (
                        <span className="text-[0.6rem] uppercase text-amber-700">★ Starred</span>
                      )}
                      {!m.read && (
                        <span className="bg-rose-700 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-parchment">
                          New
                        </span>
                      )}
                      {m.replied && (
                        <span className="text-[0.6rem] uppercase text-stone">Replied</span>
                      )}
                      {m.labels && m.labels.length > 0 && (
                        <span className="flex gap-1">
                          {m.labels.map((l) => (
                            <span
                              key={l}
                              className="border border-ink/20 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-stone"
                            >
                              {l}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-stone">
                      <a
                        href={`mailto:${m.email}`}
                        className="font-mono text-ink hover:text-gold-deep"
                      >
                        {m.email}
                      </a>{" "}
                      · {m.subject} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openReply(m)}
                    className="border border-ink/20 bg-parchment px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-ink/5"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => dashboardApi.starMessage(m.id, !m.starred).then(refresh)}
                    title={m.starred ? "Unstar" : "Star"}
                    className="border border-ink/20 bg-parchment px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-ink/5"
                  >
                    {m.starred ? "Unstar" : "Star"}
                  </button>
                  <button
                    onClick={() => dashboardApi.toggleRead(m.id).then(refresh)}
                    className="border border-ink/20 bg-parchment px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-ink/5"
                  >
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    onClick={() => setLabelTarget(m)}
                    className="border border-ink/20 bg-parchment px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-ink/5"
                  >
                    Label
                  </button>
                  <button
                    onClick={() => messagesApi.remove(m.id).then(refresh)}
                    className="border border-rose-200 px-3 py-1 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-rose-700 hover:border-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                {m.message}
              </p>
              {m.replied && m.replyText && (
                <div className="mt-3 border-l-2 border-amber-400 bg-amber-50 px-3 py-2">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-amber-800">
                    Your reply · {m.repliedAt ? new Date(m.repliedAt).toLocaleString() : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-stone">{m.replyText}</p>
                </div>
              )}
            </article>
          );
        })}
        {!loading && shown.length === 0 && (
          <p className="border border-dashed border-ink/20 bg-parchment px-4 py-10 text-center text-sm text-stone">
            No messages in this view.
          </p>
        )}
      </div>

      {replyTo && (
        <Modal title={`Reply to ${replyTo.name}`} onClose={() => setReplyTo(null)} wide>
          <div className="space-y-4">
            {note && <Banner tone="err">{note}</Banner>}
            <p className="text-xs text-stone">
              To: <span className="font-semibold text-ink">{replyTo.email}</span>
            </p>
            <Field label="Reply">
              <textarea
                rows={10}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={inputCls}
              />
            </Field>
            <p className="text-[0.68rem] leading-relaxed text-stone">
              Opening your mail application pre-fills the message and queues it for sending. A copy is
              saved here and the message is marked as replied.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyTo(null)}
                className="border border-ink/20 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-parchment"
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                disabled={busy}
                className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80 disabled:opacity-60"
              >
                {busy ? "Preparing…" : "Send reply"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {labelTarget && (
        <Modal title={`Label "${labelTarget.name}"`} onClose={() => setLabelTarget(null)}>
          <div className="space-y-3">
            <p className="text-xs text-stone">Choose a label to attach. You can remove it later.</p>
            <div className="flex flex-wrap gap-2">
              {MESSAGE_LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(labelTarget, l)}
                  className="border border-ink/20 bg-parchment px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] hover:border-gold-deep"
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}



/* ---------- accounts: list + create / toggle / delete + my account card ---------- */

function AccountsManager({ me, onRefreshMe }: { me: SafeAccount; onRefreshMe: () => void }) {
  const [list, setList] = useState<SafeAccount[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" as "admin" | "editor" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setList(await accountsApi.list());
  }
  useEffect(() => {
    void refresh();
  }, []);

  const isAdmin = me.role === "admin";

  async function create() {
    setError("");
    setBusy(true);
    try {
      await accountsApi.create(form);
      setCreating(false);
      setForm({ name: "", email: "", password: "", role: "editor" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: SafeAccount) {
    if (!confirm(`Remove ${a.name} (${a.email})?`)) return;
    try {
      await accountsApi.remove(a.id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not remove the account.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-stone">
            {list.length} of {MAX_ACCOUNTS} accounts
          </p>
          {isAdmin && list.length < MAX_ACCOUNTS && (
            <button
              onClick={() => setCreating(true)}
              className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80"
            >
              <Icon name="plus" className="mr-1.5 inline h-3.5 w-3.5" /> Add account
            </button>
          )}
        </div>

        {!isAdmin && (
          <Banner tone="info">Only the administrator can create or remove accounts.</Banner>
        )}

        <div className="mt-3 space-y-2">
          {list.map((a) => {
            const initials = a.name
              .split(" ")
              .filter(Boolean)
              .map((s) => s[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const colors = [
              "bg-amber-200 text-amber-900",
              "bg-emerald-200 text-emerald-900",
              "bg-sky-200 text-sky-900",
              "bg-fuchsia-200 text-fuchsia-900",
              "bg-rose-200 text-rose-900",
            ];
            const color = colors[(a.name.charCodeAt(0) || 0) % colors.length];
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 border border-ink/15 bg-parchment px-4 py-3"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold",
                    color
                  )}
                >
                  {initials || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">
                    {a.name}
                    {a.id === me.id && (
                      <span className="ml-2 text-[0.6rem] uppercase text-stone">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-stone">{a.email}</p>
                </div>
                <span
                  className={cn(
                    "border px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.16em]",
                    a.role === "admin"
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-ink/20 text-stone"
                  )}
                >
                  {a.role}
                </span>
                {isAdmin && a.id !== me.id && (
                  <button
                    onClick={() => remove(a)}
                    className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-rose-700 hover:text-rose-900"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {creating && (
          <Modal title="New account" onClose={() => setCreating(false)}>
            <div className="space-y-4">
              {error && <Banner tone="err">{error}</Banner>}
              <Field label="Full name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Temporary password" hint="Min 8 chars, upper, lower, number. The recipient can change it after signing in.">
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls}
                  placeholder="Min 8 chars, upper, lower, number"
                />
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "editor" })}
                  className={inputCls}
                >
                  <option value="editor">Editor — manage content & messages</option>
                  <option value="admin">Administrator — full access</option>
                </select>
              </Field>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCreating(false)}
                  className="border border-ink/20 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] hover:bg-parchment"
                >
                  Cancel
                </button>
                <button
                  onClick={create}
                  disabled={busy}
                  className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80 disabled:opacity-60"
                >
                  {busy ? "Creating…" : "Create account"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>

      {/* My account card */}
      <aside className="border border-ink/15 bg-parchment p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-stone">Signed in</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink">{me.name}</p>
        <p className="text-sm text-stone">{me.email}</p>
        <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-gold-deep">{me.role}</p>
        <hr className="my-4 border-ink/10" />
        <p className="text-[0.7rem] text-stone">
          Change your password or email from the <strong>Settings</strong> tab.
        </p>
        <button
          onClick={onRefreshMe}
          className="mt-3 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-stone hover:text-ink"
        >
          Refresh profile
        </button>
      </aside>
    </div>
  );
}

/* ---------- settings: reply-from, reply-template, my account ---------- */

function SettingsManager({
  me,
  onEmailChange,
}: {
  me: SafeAccount;
  onEmailChange: () => void;
}) {
  const [replyFrom, setReplyFrom] = useState("");
  const [replyTemplate, setReplyTemplate] = useState({ subject: "", body: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [pwScore, setPwScore] = useState(0);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    void Promise.all([settingsApi.replyFrom(), settingsApi.replyTemplate()]).then(([from, tmpl]) => {
      setReplyFrom(from);
      setReplyTemplate(tmpl);
    });
  }, []);

  useEffect(() => {
    const p = pwForm.next;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (p.length >= 14) s++;
    setPwScore(Math.min(s, 5));
  }, [pwForm.next]);

  async function saveReplyFrom() {
    setMsg(null);
    try {
      const v = await settingsApi.setReplyFrom(replyFrom);
      setReplyFrom(v);
      setMsg({ tone: "ok", text: "Reply-from address updated." });
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Could not save." });
    }
  }

  async function saveReplyTemplate() {
    setMsg(null);
    try {
      await settingsApi.setReplyTemplate(replyTemplate);
      setMsg({ tone: "ok", text: "Reply template saved." });
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Could not save." });
    }
  }

  async function changeEmail() {
    setMsg(null);
    try {
      await accountsApi.changeMyEmail(emailForm.newEmail, emailForm.password);
      setEmailForm({ newEmail: "", password: "" });
      setMsg({ tone: "ok", text: "Your sign-in email has been updated." });
      onEmailChange();
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Could not change email." });
    }
  }

  async function changePassword() {
    setMsg(null);
    const problem = passwordProblem(pwForm.next);
    if (problem) {
      setMsg({ tone: "err", text: `The new password needs ${problem}.` });
      return;
    }
    try {
      await accountsApi.changeMyPassword(pwForm.current, pwForm.next);
      setPwForm({ current: "", next: "" });
      setMsg({ tone: "ok", text: "Your password has been changed." });
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Could not change password." });
    }
  }

  return (
    <div className="grid max-w-3xl gap-5">
      {msg && <Banner tone={msg.tone}>{msg.text}</Banner>}

      <section className="border border-ink/15 bg-parchment p-5">
        <h3 className="font-display text-lg font-bold text-ink">Reply-from address</h3>
        <p className="mt-1 text-xs text-stone">
          The email address that opens when staff reply to a contact message.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Field label="Email">
              <input
                type="email"
                value={replyFrom}
                onChange={(e) => setReplyFrom(e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
          <button
            onClick={saveReplyFrom}
            className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80"
          >
            Save
          </button>
        </div>
      </section>

      <section className="border border-ink/15 bg-parchment p-5">
        <h3 className="font-display text-lg font-bold text-ink">Reply template</h3>
        <p className="mt-1 text-xs text-stone">
          Template used when staff send a reply. The variables <code className="rounded bg-parchment-2 px-1">{`{{name}}`}</code>,{" "}
          <code className="rounded bg-parchment-2 px-1">{`{{subject}}`}</code> and{" "}
          <code className="rounded bg-parchment-2 px-1">{`{{message}}`}</code> are filled
          automatically.
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Default subject">
            <input
              value={replyTemplate.subject}
              onChange={(e) => setReplyTemplate({ ...replyTemplate, subject: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Default body">
            <textarea
              rows={8}
              value={replyTemplate.body}
              onChange={(e) => setReplyTemplate({ ...replyTemplate, body: e.target.value })}
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end">
            <button
              onClick={saveReplyTemplate}
              className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80"
            >
              Save template
            </button>
          </div>
        </div>
      </section>

      <section className="border border-ink/15 bg-parchment p-5">
        <h3 className="font-display text-lg font-bold text-ink">Change my sign-in email</h3>
        <p className="mt-1 text-xs text-stone">
          Currently <span className="font-semibold text-ink">{me.email}</span>
        </p>
        <div className="mt-4 space-y-3">
          <Field label="New email">
            <input
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Confirm with current password">
            <input
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
              className={inputCls}
            />
          </Field>
          <button
            onClick={changeEmail}
            className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80"
          >
            Update email
          </button>
        </div>
      </section>

      <section className="border border-ink/15 bg-parchment p-5">
        <h3 className="font-display text-lg font-bold text-ink">Change my password</h3>
        <Field label="Current password" hint="Used only to confirm the change is you.">
          <input
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={pwForm.next}
            onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
            className={inputCls}
          />
        </Field>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-parchment-2">
            <div
              className={cn(
                "h-full transition-all",
                pwScore <= 1 && "w-1/5 bg-rose-500",
                pwScore === 2 && "w-2/5 bg-amber-500",
                pwScore === 3 && "w-3/5 bg-amber-400",
                pwScore === 4 && "w-4/5 bg-emerald-400",
                pwScore === 5 && "w-full bg-emerald-600"
              )}
            />
          </div>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-stone">
            {pwScore === 0 && "—"}
            {pwScore === 1 && "Weak"}
            {pwScore === 2 && "Fair"}
            {pwScore === 3 && "Good"}
            {pwScore === 4 && "Strong"}
            {pwScore === 5 && "Excellent"}
          </span>
        </div>
        <button
          onClick={changePassword}
          className="mt-4 rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80"
        >
          Update password
        </button>
      </section>
    </div>
  );
}

/* ---------- dashboard: live stats, sparkline, recent activity, search ---------- */

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="h-12" />;
  const w = 320, h = 60, max = Math.max(...values, 1);
  const stepX = w / (values.length - 1);
  const points = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" aria-label="Reply activity last 14 days">
      <polyline points={points} fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="0" y1={h - 0.5} x2={w} y2={h - 0.5} stroke="var(--color-ink)" strokeOpacity="0.15" />
    </svg>
  );
}

function DashboardView({ go }: { go: (t: Tab) => void }) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [sparkline, setSparkline] = useState<number[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);

  useEffect(() => {
    void dashboardApi.overview().then(setStats);
    void dashboardApi.repliesLastDays(14).then((arr) => setSparkline(arr.map((x) => x.count)));
    void dashboardApi.recentActivity(6).then(setActivity);
  }, []);

  async function runSearch(e: FormEvent) {
    e.preventDefault();
    setSearchResult(await searchApi.acrossContent(q));
  }

  const cards: { key: Tab; label: string; icon: string; value?: number; extra?: string; tone: string }[] = [
    {
      key: "messages",
      label: "Messages",
      icon: "mail",
      value: stats?.messages,
      extra: stats?.unread ? `${stats.unread} unread` : "",
      tone: "from-amber-200 to-amber-50",
    },
    { key: "sermons", label: "Sermons", icon: "book", value: stats?.sermons, tone: "from-sky-200 to-sky-50" },
    { key: "events", label: "Events", icon: "clock", value: stats?.events, tone: "from-emerald-200 to-emerald-50" },
    {
      key: "announcements",
      label: "Announcements",
      icon: "radio",
      value: stats?.announcements,
      tone: "from-fuchsia-200 to-fuchsia-50",
    },
    { key: "media", label: "Media items", icon: "star", value: stats?.media, tone: "from-rose-200 to-rose-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="border border-ink/15 bg-gradient-to-br from-parchment to-parchment-2 p-6">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gold-deep">
          At a glance
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-stone">
          {stats?.unread ? (
            <>You have <strong>{stats.unread}</strong> unread message{stats.unread === 1 ? "" : "s"} waiting.</>
          ) : (
            <>Everything is up to date.</>
          )}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={() => go(c.key)}
              className={cn(
                "group relative overflow-hidden border border-ink/10 bg-gradient-to-br p-4 text-left transition-transform hover:-translate-y-0.5",
                c.tone
              )}
            >
              <Icon name={c.icon} className="h-6 w-6 text-ink/60 transition-colors group-hover:text-ink" />
              <p className="mt-3 font-display text-3xl font-bold tabular-nums text-ink">{c.value ?? "—"}</p>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink/70">
                {c.label}
              </p>
              {c.extra && (
                <p className="mt-1 text-[0.62rem] font-semibold text-rose-700">{c.extra}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={runSearch} className="border border-ink/15 bg-parchment p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-stone">
          Search content
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find any sermon, event, announcement, message, or media item…"
            className="flex-1 border border-ink/20 bg-parchment px-3 py-2 text-sm focus:border-gold-deep focus:outline-none"
          />
          <button className="rounded-sm bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80">
            Search
          </button>
        </div>
        {searchResult && (
          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
            {(["sermons", "events", "announcements", "media", "messages"] as const).map((k) => (
              <div key={k} className="border border-ink/10 bg-parchment-2 p-3">
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-stone">
                  {k} ({searchResult[k].length})
                </p>
                <ul className="mt-1 space-y-1">
                  {searchResult[k].slice(0, 4).map((x: any) => (
                    <li key={x.id} className="truncate text-ink/80">{x.title ?? x.subject ?? x.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Activity */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="border border-ink/15 bg-parchment p-5">
          <div className="flex items-center justify-between">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-stone">
              Reply activity · 14 days
            </p>
            <p className="font-display text-lg font-bold text-ink">
              {sparkline.reduce((a, b) => a + b, 0)}
            </p>
          </div>
          <div className="mt-3">
            <Sparkline values={sparkline} />
          </div>
          <ul className="mt-5 divide-y divide-ink/10">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 py-2 text-xs">
                <Icon name="check" className="mt-0.5 h-3.5 w-3.5 text-gold-deep" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-ink">{a.actor}</p>
                  <p className="text-stone">{a.action} {a.detail ? `· ${a.detail}` : ""}</p>
                </div>
                <time className="shrink-0 text-stone">{new Date(a.at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-ink/15 bg-parchment p-5">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-stone">
            Reply-from
          </p>
          <p className="mt-2 font-mono text-sm text-ink">{stats?.replyFrom ?? "…"}</p>
          <hr className="my-4 border-ink/10" />
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-stone">
            Reply settings
          </p>
          <p className="mt-2 text-xs text-stone">
            Customise the reply-from address and template from the Settings tab.
          </p>
          <button
            onClick={() => go("settings")}
            className="mt-3 rounded-sm border border-ink/30 bg-parchment px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.16em] hover:border-ink/60"
          >
            Open Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    void dashboardApi.auditLog().then((all) => {
      setEntries(all);
      setLoading(false);
    });
  }, []);
  const shown = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(
      (e) => e.actor.toLowerCase().includes(q) || e.action.toLowerCase().includes(q)
    );
  }, [entries, filter]);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone">{entries.length} events</p>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter actor or action…"
          className="border border-ink/20 bg-parchment px-3 py-1.5 text-sm"
        />
      </div>
      <div className="overflow-hidden border border-ink/15 bg-parchment">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/15 bg-parchment-2 text-[0.65rem] uppercase tracking-[0.16em] text-stone">
            <tr>
              <th className="px-4 py-2 text-left font-bold">When</th>
              <th className="px-4 py-2 text-left font-bold">Actor</th>
              <th className="px-4 py-2 text-left font-bold">Action</th>
              <th className="px-4 py-2 text-left font-bold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 100).map((e, i) => (
              <tr key={i} className="border-b border-ink/10 last:border-0">
                <td className="px-4 py-2 text-stone">{new Date(e.at).toLocaleString()}</td>
                <td className="px-4 py-2 font-mono text-ink">{e.actor}</td>
                <td className="px-4 py-2 font-mono text-ink">{e.action}</td>
                <td className="px-4 py-2 text-stone">{e.detail || ""}</td>
              </tr>
            ))}
            {!loading && shown.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone">
                  No matching activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "messages", label: "Messages", icon: "mail" },
  { id: "sermons", label: "Sermons", icon: "book" },
  { id: "events", label: "Events", icon: "clock" },
  { id: "announcements", label: "Announcements", icon: "radio" },
  { id: "media", label: "Media", icon: "star" },
  { id: "search", label: "Search", icon: "book" },
  { id: "activity", label: "Activity log", icon: "book" },
  { id: "accounts", label: "Accounts", icon: "people" },
  { id: "settings", label: "Settings", icon: "shield" },
];

export default function Admin() {
  const [me, setMe] = useState<SafeAccount | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    void auth.me().then((account) => {
      if (!account) navigate(ROUTES.gate);
      else setMe(account);
    });
  }, []);

  async function refreshMe() {
    const a = await auth.me();
    if (a) setMe(a);
  }

  function signOut() {
    auth.signOut();
    navigate(ROUTES.gate);
  }

  if (!me) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-parchment-2">
        <p className="text-sm text-stone">Loading…</p>
      </div>
    );
  }

  const sermonFields: FieldDef[] = [
    { key: "title", label: "Title", required: true },
    { key: "startDate", label: "Starting Day (Date)", type: "date", required: true },
    { key: "startTime", label: "Starting Time", type: "time", required: true },
    { key: "endDate", label: "Ending Day (Date)", type: "date", required: false, hint: "Optional. Leave blank for a single-day sermon/gathering." },
    { key: "endTime", label: "Ending Time", type: "time", required: false, hint: "Optional. Leave blank if open-ended." },
    { key: "scripture", label: "Scripture (e.g. Genesis 32:24–30)", required: true },
    { key: "preacher", label: "Preacher", required: true },
    { key: "imageUrl", label: "Thumbnail Image Link", type: "text", required: false, placeholder: "https://... (direct image link)", hint: "Optional image URL for card and header." },
    { key: "summary", label: "Short summary", type: "textarea", required: false, hint: "Optional brief summary." },
    { key: "body", label: "Full Content (blank line between paragraphs)", type: "paragraphs", required: false, hint: "Optional long-form content, transcript, or notes." },
  ];

  const occasionFields = (defaultType: string): FieldDef[] => [
    { key: "title", label: "Title", required: true },
    { key: "startDate", label: "Starting Day (Date)", type: "date", required: true },
    { key: "startTime", label: "Starting Time", type: "time", required: true },
    { key: "endDate", label: "Ending Day (Date)", type: "date", required: false, hint: "Optional. Set for multi-day events or conferences." },
    { key: "endTime", label: "Ending Time", type: "time", required: false, hint: "Optional conclusion time." },
    { key: "type", label: "Tag / Category", placeholder: defaultType, required: false },
    { key: "imageUrl", label: "Thumbnail Image Link", type: "text", required: false, placeholder: "https://... (direct image link)", hint: "Optional image thumbnail URL." },
    { key: "detail", label: "Short Detail", type: "textarea", required: false, hint: "Optional brief summary." },
    { key: "body", label: "Full Content (blank line between paragraphs)", type: "paragraphs", required: false, hint: "Optional detailed schedule, requirements, or overview." },
  ];

  const mediaFields: FieldDef[] = [
    { key: "title", label: "Title", required: true },
    { key: "startDate", label: "Starting Day (Date)", type: "date", required: true },
    { key: "startTime", label: "Starting Time", type: "time", required: false, hint: "Optional start time." },
    { key: "endDate", label: "Ending Day (Date)", type: "date", required: false, hint: "Optional conclusion date." },
    { key: "endTime", label: "Ending Time", type: "time", required: false, hint: "Optional conclusion time." },
    { key: "kind", label: "Kind (e.g. Photos, Audio, Video)", required: true },
    { key: "image", label: "Stock Image Choice", type: "select", options: IMAGE_OPTIONS, required: false },
    { key: "imageUrl", label: "Thumbnail Image Link", type: "text", required: false, placeholder: "https://... (direct image link)", hint: "Optional external image/cover URL." },
    { key: "detail", label: "Short Caption", type: "textarea", required: false, hint: "Optional caption." },
    { key: "body", label: "Full Content / Description (blank line between paragraphs)", type: "paragraphs", required: false, hint: "Optional long-form article or gallery overview." },
  ];

  return (
    <div className="min-h-svh bg-parchment-2">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-ebony text-parchment">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="font-display text-sm font-bold">Pentecostal Penuel</p>
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold-2">Management Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-xs sm:block">
              <span className="block font-semibold">{me.name}</span>
              <span className="block text-parchment/60">{me.role}</span>
            </span>
            <button
              onClick={signOut}
              className="border border-parchment/30 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-parchment hover:bg-parchment/10"
            >
              Sign out
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden"
              aria-label="Menu"
            >
              <Icon name="plus" className={cn("h-6 w-6 transition-transform", menuOpen && "rotate-45")} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-52 shrink-0 lg:block",
            menuOpen ? "block" : "hidden"
          )}
        >
          <nav className="sticky top-24 space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  tab === t.id
                    ? "border-gold-deep bg-parchment text-ink shadow-sm"
                    : "border-transparent text-stone hover:bg-parchment/60 hover:text-ink"
                )}
              >
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <h1 className="mb-5 font-display text-2xl font-bold text-ink">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>

          {tab === "dashboard" && <DashboardView go={setTab} />}
          {tab === "messages" && <MessagesManager />}
          {tab === "sermons" && (
            <CollectionManager
              config={{
                title: "sermon",
                api: sermonsApi,
                fields: sermonFields,
                primary: (i) => i.title,
                secondary: (i) => `${i.day} ${i.month} · ${i.scripture} · ${i.preacher}`,
              }}
            />
          )}
          {tab === "events" && (
            <CollectionManager
              config={{
                title: "event",
                api: eventsApi,
                fields: occasionFields("Upcoming Event"),
                primary: (i) => i.title,
                secondary: (i) => `${i.day} ${i.month} · ${i.time}`,
              }}
            />
          )}
          {tab === "announcements" && (
            <CollectionManager
              config={{
                title: "announcement",
                api: announcementsApi,
                fields: occasionFields("Announcement"),
                primary: (i) => i.title,
                secondary: (i) => `${i.day} ${i.month} · ${i.time}`,
              }}
            />
          )}
          {tab === "media" && (
            <CollectionManager
              config={{
                title: "media item",
                api: mediaApi,
                fields: mediaFields,
                primary: (i) => i.title,
                secondary: (i) => `${i.kind} · ${i.date}`,
              }}
            />
          )}
          {tab === "search" && (
            <SearchView />
          )}
          {tab === "activity" && <ActivityView />}
          {tab === "accounts" && (
            <AccountsManager me={me} onRefreshMe={refreshMe} />
          )}
          {tab === "settings" && (
            <SettingsManager me={me} onEmailChange={refreshMe} />
          )}
        </main>
      </div>
    </div>
  );
}

function SearchView() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any | null>(null);
  async function run(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setResults(await searchApi.acrossContent(q));
  }
  return (
    <div>
      <form onSubmit={run} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a sermon, event, announcement, or message…"
          className="flex-1 border border-ink/20 bg-parchment px-3 py-2 text-sm focus:border-gold-deep focus:outline-none"
        />
        <button className="rounded-sm bg-ink px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-parchment transition-colors hover:bg-ink/80">
          Search
        </button>
      </form>
      {results ? (
        <div className="space-y-6">
          {(["sermons", "events", "announcements", "media", "messages"] as const).map((k) => (
            <div key={k}>
              <h3 className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-stone">
                {k} ({results[k].length})
              </h3>
              {results[k].length === 0 ? (
                <p className="text-sm text-stone">Nothing here.</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {results[k].map((x: any) => (
                    <article
                      key={x.id}
                      className="border border-ink/15 bg-parchment p-4"
                    >
                      <p className="font-display text-sm font-bold text-ink">{x.title ?? x.subject ?? x.name}</p>
                      <p className="mt-1 line-clamp-3 text-xs text-stone">
                        {x.summary ?? x.detail ?? x.message ?? x.preacher ?? ""}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-ink/20 bg-parchment px-4 py-8 text-center text-sm text-stone">
          Try a name, a Bible verse, a phrase from a sermon, or an email address.
        </p>
      )}
    </div>
  );
}
