import { useEffect, useState } from "react";
import { Icon } from "../components/Icons";
import { Link, ROUTES } from "../lib/router";
import { api } from "../services/api";

/**
 * Read-only data explorer.
 *
 * Everything CRUD happens in the Admin tab now. This screen only shows
 * the underlying tables for the operators who want to see what's stored
 * and where it comes from. No edits happen here.
 */

type TableKey =
  | "sermons"
  | "events"
  | "announcements"
  | "media"
  | "messages"
  | "audit";

interface TableDef {
  key: TableKey;
  title: string;
  description: string;
  icon: string;
}

const TABLES: TableDef[] = [
  { key: "sermons", title: "sermons", description: "Recent sermons with preacher, scripture, and date.", icon: "note" },
  { key: "events", title: "events", description: "Upcoming events shown on the Home page and Publications.", icon: "clock" },
  { key: "announcements", title: "announcements", description: "Announcements displayed on the site.", icon: "radio" },
  { key: "media", title: "media", description: "Media archive: photo galleries, audio, video.", icon: "star" },
  { key: "messages", title: "messages", description: "Contact-form messages received from the public site.", icon: "mail" },
  { key: "audit", title: "audit", description: "Every privileged action is recorded here.", icon: "shield" },
];

export default function Database() {
  const [counts, setCounts] = useState<Record<TableKey, number>>(() =>
    Object.fromEntries(TABLES.map((t) => [t.key, 0])) as Record<TableKey, number>
  );
  const [active, setActive] = useState<TableKey | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    void refreshCounts();
  }, []);

  useEffect(() => {
    if (active) void loadTable(active);
  }, [active]);

  async function refreshCounts() {
    try {
      const results = await Promise.all(
        TABLES.map(async (t) => {
          const data = await loadFor(t.key);
          return data.length;
        })
      );
      const map = Object.fromEntries(TABLES.map((t, i) => [t.key, results[i]])) as Record<
        TableKey,
        number
      >;
      setCounts(map);
    } catch {
      // ignore — counts are a nice-to-have
    }
  }

  async function loadFor(key: TableKey): Promise<any[]> {
    switch (key) {
      case "sermons":
        return (await api.sermons()) || [];
      case "events":
        return (await api.events()) || [];
      case "announcements":
        return (await api.announcements()) || [];
      case "media":
        return (await api.media()) || [];
      case "messages":
        return (await api.messages()) || [];
      case "audit":
        return (await api.auditLog()) || [];
    }
  }

  async function loadTable(key: TableKey) {
    setSelected(null);
    setRows(await loadFor(key));
  }

  const activeDef = active ? TABLES.find((t) => t.key === active) : null;

  return (
    <section className="min-h-[90svh] bg-parchment-2">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 pb-6">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-gold-deep">
              Database Explorer
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
              {activeDef ? (
                <>
                  <button
                    onClick={() => setActive(null)}
                    className="text-gold-deep hover:text-ink"
                  >
                    Tables
                  </button>
                  <span className="mx-2 text-stone/40">/</span>
                  <span>{activeDef.title}</span>
                </>
              ) : (
                <>Tables ({TABLES.length})</>
              )}
            </h1>
            {activeDef && (
              <p className="mt-1 text-sm text-stone">{activeDef.description}</p>
            )}
          </div>
          <Link to={ROUTES.panel} className="border border-ink/20 bg-parchment px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] hover:border-ink/60">
            Back to Dashboard
          </Link>
        </div>

        {!active && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TABLES.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className="group flex flex-col items-start gap-3 border border-ink/15 bg-parchment p-5 text-left transition-all hover:-translate-y-1 hover:border-gold-deep/50"
              >
                <div className="flex w-full items-center justify-between">
                  <Icon name={t.icon} className="h-6 w-6 text-gold-deep" />
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-deep">
                    view-only
                  </span>
                </div>
                <div className="w-full">
                  <p className="font-mono text-sm font-bold text-ink">{t.title}</p>
                  <p className="mt-1.5 text-[0.78rem] leading-snug text-stone">{t.description}</p>
                </div>
                <div className="flex w-full items-center justify-between border-t border-ink/10 pt-3">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone">
                    Rows
                  </span>
                  <span className="font-display text-2xl font-bold tabular-nums text-ink">
                    {counts[t.key] ?? 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {active && !selected && (
          <div className="mt-6">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-stone">
                {rows.length} {rows.length === 1 ? "record" : "records"}
              </p>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-emerald-800">
                Source: live
              </span>
            </div>

            {rows.length === 0 ? (
              <p className="mt-10 border border-ink/15 bg-parchment p-10 text-center text-stone">
                No records in this table yet.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-ink/15 bg-parchment-2/60">
                      {getColumns(active).map((col) => (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left text-[0.68rem] font-bold uppercase tracking-[0.22em] text-stone"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.22em] text-stone">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-ink/10 bg-parchment hover:bg-parchment-2/70">
                        {getColumns(active).map((col) => (
                          <td
                            key={col.key}
                            className="max-w-xs truncate px-4 py-3 text-ink"
                            title={String(row[col.key] ?? "")}
                          >
                            {formatCell(row[col.key])}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelected(row)}
                            className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold-deep hover:text-ink"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {active && selected && (
          <div className="mt-6 border border-ink/15 bg-parchment p-6">
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-gold-deep">
                  Record · {active}
                </p>
                <p className="mt-1 font-mono text-xs text-stone">
                  id: {selected.id ?? "—"}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="border border-ink/20 bg-parchment px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] hover:border-ink/60"
              >
                ← Back to list
              </button>
            </div>
            <dl className="mt-5 space-y-4">
              {Object.entries(selected).map(([key, value]) => (
                <div
                  key={key}
                  className="grid gap-2 border-b border-ink/5 pb-4 sm:grid-cols-[180px_1fr]"
                >
                  <dt className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-stone">
                    {key}
                  </dt>
                  <dd className="whitespace-pre-wrap break-words text-sm text-ink">
                    {formatCell(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

function getColumns(key: TableKey): { key: string; label: string }[] {
  switch (key) {
    case "sermons":
      return [
        { key: "day", label: "Day" },
        { key: "month", label: "Month" },
        { key: "title", label: "Title" },
        { key: "scripture", label: "Scripture" },
        { key: "preacher", label: "Preacher" },
      ];
    case "events":
      return [
        { key: "day", label: "Day" },
        { key: "month", label: "Month" },
        { key: "time", label: "Time" },
        { key: "type", label: "Type" },
        { key: "title", label: "Title" },
      ];
    case "announcements":
      return [
        { key: "day", label: "Day" },
        { key: "month", label: "Month" },
        { key: "time", label: "Time" },
        { key: "type", label: "Type" },
        { key: "title", label: "Title" },
      ];
    case "media":
      return [
        { key: "kind", label: "Kind" },
        { key: "title", label: "Title" },
        { key: "date", label: "Date" },
      ];
    case "messages":
      return [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "createdAt", label: "Received" },
      ];
    case "audit":
      return [
        { key: "actor", label: "Actor" },
        { key: "action", label: "Action" },
        { key: "detail", label: "Detail" },
        { key: "at", label: "When" },
      ];
  }
}

function formatCell(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return `${v.length} item${v.length === 1 ? "" : "s"}`;
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  const s = String(v);
  return s.length > 140 ? s.slice(0, 140) + "…" : s;
}
