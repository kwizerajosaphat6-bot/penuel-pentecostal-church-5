# Security & Performance Audit — Pentecostal Penuel Church

**Scope:** entire repository (frontend, backend, database, build, deployment)
**Target stack:** Cloudflare DNS + Pages · Render · Neon PostgreSQL
**Production domain:** `https://penuelpentecostalchurch.org`

---

## 1. Executive summary

The site was functionally complete but **not safe to deploy publicly**. Five
findings were critical — any one of them would have allowed a stranger to take
full control of the church's content.

| Severity | Found | Fixed |
| -------- | ----- | ----- |
| Critical | 5 | 5 |
| High | 8 | 8 |
| Medium | 11 | 11 |
| Low / hygiene | 9 | 9 |

The build output also shrank by **69 %** (2,203 kB → 679 kB; gzip 1,464 kB → 316 kB).

---

## 2. Critical findings

### C-1 — Hard-coded administrator credentials in the shipped bundle
**Was:** `src/pages/Login.tsx` contained
`admin@penuelchurch.org` / `penuel2024`, and printed them on screen.
Anyone who opened the page — or read the JavaScript — became an administrator.

**Fix:** the entire local-credential branch is deleted. `Login.tsx` now calls
the server and nothing else. There is no demo account, no offline bypass, and
no credential anywhere in the repository.

### C-2 — Authentication could be bypassed by editing browser storage
**Was:** the admin panel trusted `localStorage.penuel_session`. Typing
`localStorage.setItem('penuel_session', '{"admin":{"role":"super_admin"}}')`
into the console granted full access, because `api.me()` only read local state.

**Fix:** `api.me()` now calls `GET /session` and the server decides. A new
`<Guard>` component in `App.tsx` blocks every staff route until the server
confirms the token. Local state is never authoritative.

### C-3 — The auth router crashed on import (routes were unreachable/unprotected)
**Was:** `server/src/routes/auth.js` imported `./security.js` and `./auth.js`,
but those files live in `../middleware/`. It also used `sanitize` — a plain
function — as Express middleware.

**Fix:** imports corrected, `sanitize` replaced by real schema middleware.

### C-4 — Refresh tokens stored in plaintext, never rotated
**Was:** raw tokens in the database with no rotation and no reuse detection. A
database leak handed an attacker permanent sessions.

**Fix:** only a SHA-256 hash is stored. Tokens rotate on every use, and
presenting an already-rotated token is treated as theft — **every** session for
that admin is destroyed immediately.

### C-5 — Mass-assignment on every admin write endpoint
**Was:** `data: req.body` was passed straight to Prisma. A logged-in *editor*
could POST `{"role":"SUPER_ADMIN"}` and escalate their own privileges.

**Fix:** every endpoint validates against an explicit Zod allow-list
(`server/src/lib/validate.js`). Unknown fields are stripped before Prisma.

---

## 3. High findings

| ID | Issue | Fix |
| -- | ----- | --- |
| H-1 | No authorisation tiers — any login could delete anything | `requireRole()` guard; prayer requests and audit log are `SUPER_ADMIN` only |
| H-2 | JWT verified without pinning the algorithm | `algorithms: ["HS256"]` — blocks the `alg:none` downgrade |
| H-3 | JWT had no issuer/audience | `iss`/`aud` set and verified — a token from elsewhere is rejected |
| H-4 | Login revealed whether an e-mail existed (timing + wording) | Identical message, plus a dummy bcrypt compare to equalise timing |
| H-5 | No brute-force lockout | 8 failures → 15-minute lock, plus per-IP rate limit |
| H-6 | SQLite — cannot run on Render's ephemeral disk (total data loss on redeploy) | Migrated to PostgreSQL (Neon) with pooled + direct URLs |
| H-7 | Contact form was fake (`setTimeout`) — messages were silently discarded | Wired to `POST /api/contact` with real persistence |
| H-8 | Home page called **admin** endpoints for public data | Split into `publicSermons()` / `publicOccasions()` |

---

## 4. Medium findings

| ID | Issue | Fix |
| -- | ----- | --- |
| M-1 | Predictable `/admin`, `/admin/login` paths | Renamed to `/office-7f3a91/…`; API base path is env-configurable |
| M-2 | Admin panel linked from the public footer | Link removed — scanners no longer get a free map |
| M-3 | Staff pages were indexable | `noindex, nofollow` applied per-route; also in `robots.txt` |
| M-4 | Prisma error codes leaked table/column names | Central handler maps `P2002`→409, `P2025`→404 with neutral text |
| M-5 | Stack traces reachable in error responses | Detail goes to the server log only; client gets one of eight fixed strings |
| M-6 | `console.error` in the Express handler could log secrets | Redacting logger strips tokens, passwords and connection strings |
| M-7 | No `Permissions-Policy`, `COOP`, `CORP` | All set in `public/_headers` and via helmet |
| M-8 | CORS threw on rejection → 500 with a stack | Returns a clean CORS refusal instead |
| M-9 | No payload size limit tuning (1 MB default) | 32 kB body cap + 415 on wrong content type |
| M-10 | No `robots.txt`, `sitemap.xml`, canonical, OG tags | All added with the production domain |
| M-11 | Refresh tokens accumulated forever | Hourly prune job in `index.js` |

---

## 5. Low / hygiene

* `X-Powered-By`, `Server`, `Via`, `X-AspNet-Version` stripped on every response.
* `ETag` disabled on the API to prevent cache-probing.
* `hpp` blocks `?a=1&a=2` parameter-pollution.
* Route params validated as UUIDs — blocks path-traversal in IDs.
* Contact form stores only a truncated `/24` network, never a full IP (GDPR-friendly).
* Honeypot answers `202` so bots cannot detect they were caught.
* Graceful `SIGTERM` shutdown so Render deploys don't drop in-flight requests.
* `bcrypt` cost raised to 12; seeder enforces a 12-char mixed-case password.
* Root `.gitignore` guarantees no `.env` is ever committed.

---

## 6. Technology-fingerprint suppression

| Signal | Status |
| ------ | ------ |
| `X-Powered-By: Express` | Removed (`scrubFingerprints` + `app.disable`) |
| `Server:` header | Stripped at origin; Cloudflare replaces it at the edge |
| Express 404 HTML page | Replaced by a neutral JSON `{"error":"Not found."}` |
| Express stack-trace page | Never rendered — custom handler always returns JSON |
| Prisma / PostgreSQL error text | Mapped to generic messages |
| React / Vite dev hints | Production build only; no source maps emitted |
| `/healthz` | Returns `{"status":"ok"}` and nothing else |
| Response shape probing | 404 and 403 are indistinguishable in body shape |

> **Honest limitation:** a determined observer can still infer *React* from the
> DOM structure. Hiding that entirely would mean server-side rendering. What
> matters is that **no version numbers** are exposed, so automated
> vulnerability scanners have nothing to match against.

---

## 7. Performance audit

### Before

| Metric | Value |
| ------ | ----- |
| `dist/index.html` | **2,203 kB** (gzip 1,464 kB) |
| Requests to first paint | 1 (everything blocking) |
| Images | 4 × base64, inlined into the HTML |
| Fonts | 5 files, inlined |
| Admin JS | Shipped to every visitor |

### After

| Metric | Value | Change |
| ------ | ----- | ------ |
| `dist/index.html` | **679 kB** (gzip 316 kB) | **−69 % / −78 %** |
| Images | 4 separate files, cached 1 year, lazy-loaded | parallel + reusable |
| Admin JS | Code-split, fetched only after sign-in | removed from critical path |
| Below-fold sections | `content-visibility: auto` | skipped until scrolled near |
| API responses | gzip + `stale-while-revalidate` | served from Cloudflare edge |

**Why the images mattered most.** Base64 inflates binary data by ~33 % *and*
makes it un-cacheable — the browser had to re-download 2 MB of photos inside
the HTML on every single visit, before it could paint anything. Serving them
from `/images/` means they download in parallel, lazy-load below the fold, and
are cached for a year.

### Remaining opportunity (needs one config change you must make by hand)

`vite.config.ts` still uses `viteSingleFile()`, which inlines all JS and CSS
into `index.html`. Removing it would:

* enable real per-route code-splitting and long-term hashed-asset caching,
* let you delete `'unsafe-inline'` from `script-src` in the CSP.

```ts
// vite.config.ts — recommended production change
export default defineConfig({
  plugins: [react(), tailwindcss()],   // <- viteSingleFile() removed
  build: { target: "es2020", cssCodeSplit: true, sourcemap: false },
});
```

This is left for you to apply because it changes the build contract.

---

## 8. Architecture & maintainability

**Fixed**

* Config centralised in `server/src/config.js`, which **refuses to boot** in
  production if a secret is missing or weak — no silent insecure defaults.
* Four near-identical CRUD route blocks replaced by one `crud()` factory, so
  validation/auditing/authorisation can never drift apart between resources.
* Structured JSON logging with redaction, ready for Render's log viewer.
* Prisma is the only database access path — **no raw SQL anywhere**, so
  injection is structurally impossible, not merely filtered.

**Deliberate remaining trade-off**

`src/services/localDb.ts` (IndexedDB) is retained as an *offline cache only*.
It holds no credentials and is never consulted for authentication. It is
per-browser and is not a substitute for the server database.

---

## 9. Post-deployment security checklist

Work through this **after** the first deploy.

- [ ] `curl -I https://penuelpentecostalchurch.org` → no `Server` / `X-Powered-By`
- [ ] `curl -I https://api.penuelpentecostalchurch.org/healthz` → `{"status":"ok"}`
- [ ] Visiting `https://api.…/api/mgmt-7f3a91/messages` without a token → `401`
- [ ] Nine wrong passwords in a row → account locks, then `429`
- [ ] Site scores **A/A+** at <https://securityheaders.com>
- [ ] Site scores **A** at <https://www.ssllabs.com/ssltest/>
- [ ] `SEED_ADMIN_PASSWORD` deleted from Render after the first seed
- [ ] `JWT_SECRET` is 64+ random characters and unique to production
- [ ] `ADMIN_API_PATH` changed from the example value
- [ ] `ALLOWED_ORIGINS` contains **only** your real domains
- [ ] `git log -p | grep -i -E "password|secret|api[_-]?key"` → nothing
- [ ] Neon: IP allow-list or "require SSL" enabled
- [ ] Cloudflare: SSL mode **Full (strict)**, Always Use HTTPS **on**
- [ ] `sitemap.xml` submitted in Google Search Console
- [ ] `/office-7f3a91` returns `noindex` and is not in Google
- [ ] Set a calendar reminder to rotate `JWT_SECRET` every 90 days
