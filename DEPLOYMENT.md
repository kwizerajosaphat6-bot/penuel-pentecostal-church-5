# Deployment Guide — Pentecostal Penuel Church

A step-by-step guide written for someone who has **never deployed a website
before**. Follow the parts in order. Total time: about 45 minutes. Everything
used here is free.

```
Visitor
   │
   ▼
Cloudflare DNS + CDN  ──►  Cloudflare Pages   (the website you see)
                                  │
                                  │ HTTPS
                                  ▼
                            Render            (the API / staff area)
                                  │
                                  ▼
                            Neon PostgreSQL   (the database)
```

**Three things to decide before you start** — write them down:

| Thing | Example | Yours |
| ----- | ------- | ----- |
| A long random `JWT_SECRET` | `kZ8x…` (64 chars) | |
| A secret admin path | `/api/mgmt-7f3a91` | |
| A strong admin password | 16+ mixed characters | |

Generate the secret by pasting this into <https://www.random.org/strings/> or,
if you have Node installed:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Part 1 — Neon (the database)

1. Go to <https://neon.tech> → **Sign up** (free tier).
2. **Create a project.** Name it `penuel-church`. Pick the region closest to
   your congregation.
3. Neon shows you a connection string. You need **two** versions of it —
   click **Connection Details**:
   * **Pooled** (the host contains `-pooler`) → this is `DATABASE_URL`
   * **Direct** (no `-pooler`) → this is `DIRECT_DATABASE_URL`
4. Copy both somewhere safe. They look like:

```
postgresql://neondb_owner:PASSWORD@ep-cool-frog-12345-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

5. Add `&pgbouncer=true&connect_timeout=15` to the **end of the pooled one**.

> **Why two URLs?** The pooled one shares a small number of connections between
> many requests, which is what a free server needs. But database *migrations*
> need a direct, unshared connection. Prisma uses each at the right moment.

**Security settings to turn on in Neon:**

* **Settings → IP Allow** — once Render is running, restrict access to Render's
  IPs. Until then, `sslmode=require` (already in the URL) keeps traffic encrypted.
* Never share the connection string. It contains the password.
* Neon auto-suspends the free database when idle — the first request after a
  quiet period takes ~1 second. This is normal.

---

## Part 2 — Render (the backend)

1. Push this project to GitHub (a **private** repository is fine and preferred).
2. Go to <https://render.com> → **New** → **Web Service** → connect your repo.
3. Fill in:

| Field | Value |
| ----- | ----- |
| Name | `penuel-api` |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm start` |
| Health Check Path | `/healthz` |
| Instance Type | Free |

4. Click **Advanced → Add Environment Variable** and add each of these:

| Key | Value |
| --- | ----- |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `true` |
| `DATABASE_URL` | *(pooled Neon URL)* |
| `DIRECT_DATABASE_URL` | *(direct Neon URL)* |
| `JWT_SECRET` | *(your 64-char secret)* |
| `ADMIN_API_PATH` | `/api/mgmt-7f3a91` *(change the digits!)* |
| `ALLOWED_ORIGINS` | `https://penuelpentecostalchurch.org,https://www.penuelpentecostalchurch.org` |
| `SEED_ADMIN_EMAIL` | your e-mail |
| `SEED_ADMIN_NAME` | your name |
| `SEED_ADMIN_PASSWORD` | your strong password |

5. **Create Web Service.** Wait for the green *Live* badge.
6. Open the **Shell** tab and run once:

```bash
npm run db:seed
```

You should see `[seed] administrator created:` followed by your e-mail.

7. **Important:** go back to Environment and **delete `SEED_ADMIN_PASSWORD`**.
   It has done its job; leaving it there is an unnecessary risk.

8. Note your API address: `https://penuel-api.onrender.com`.

> **Free-tier note:** Render sleeps the service after 15 minutes of inactivity.
> The first visit afterwards takes ~30 seconds to wake. The *website* is not
> affected (it is static) — only the contact form and staff area. To avoid it,
> use a free uptime pinger such as UptimeRobot hitting `/healthz` every 10 min.

---

## Part 3 — Cloudflare Pages (the website)

1. Go to <https://dash.cloudflare.com> → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git** → select your repo.
2. Build settings:

| Field | Value |
| ----- | ----- |
| Framework preset | None |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |

3. **Save and Deploy.**

### Point the frontend at your API

Open `index.html` and update these two lines to your real Render URL and the
admin path you chose, then commit:

```html
<meta name="api-url" content="https://api.penuelpentecostalchurch.org/api" />
<meta name="admin-api-path" content="https://api.penuelpentecostalchurch.org/api/mgmt-7f3a91" />
```

Also update the same domain in `public/_headers` (the `connect-src` line) —
the browser blocks any API call to a domain not listed there.

---

## Part 4 — Cloudflare DNS & domain

1. **Websites → Add a site** → `penuelpentecostalchurch.org`, choose **Free**.
2. Cloudflare gives you two nameservers. Enter them at your domain registrar
   (where you bought the name). Propagation takes 5 minutes to 24 hours.
3. **Pages → your project → Custom domains** → add both
   `penuelpentecostalchurch.org` and `www.penuelpentecostalchurch.org`.
4. **DNS → Records** → add a record so the API has a tidy address:

| Type | Name | Target | Proxy |
| ---- | ---- | ------ | ----- |
| CNAME | `api` | `penuel-api.onrender.com` | **Proxied** (orange cloud) |

### Recommended Cloudflare settings — and why

| Where | Setting | Value | Why it matters |
| ----- | ------- | ----- | -------------- |
| SSL/TLS → Overview | Encryption mode | **Full (strict)** | Encrypts Cloudflare→Render *and* verifies the certificate. "Flexible" would leave that leg unencrypted — never use it. |
| SSL/TLS → Edge Certificates | Always Use HTTPS | **On** | Silently upgrades any `http://` visitor before data is sent. |
| SSL/TLS → Edge Certificates | Minimum TLS Version | **TLS 1.2** | Blocks obsolete, breakable encryption. |
| SSL/TLS → Edge Certificates | HSTS | **On**, 6 months, include subdomains | Tells browsers to *only* ever use HTTPS for your domain. Turn this on only once HTTPS works — it is hard to undo. |
| SSL/TLS → Edge Certificates | Automatic HTTPS Rewrites | **On** | Fixes accidental `http://` links inside pages. |
| Security → Settings | Security Level | **Medium** | Challenges known-bad IPs without annoying real visitors. |
| Security → Bots | Bot Fight Mode | **On** | Free automated-scraper blocking — keeps spam off the contact form. |
| Security → WAF | Managed Ruleset | **On** | Free protection against common injection and exploit patterns. |
| Speed → Optimization | Brotli | **On** | Compresses better than gzip; pages arrive faster. |
| Speed → Optimization | Early Hints | **On** | Lets browsers start fetching images sooner. |
| Caching | Caching Level | **Standard** | Honours the rules already set in `public/_headers`. |
| Caching | Browser Cache TTL | **Respect Existing Headers** | Our images are marked immutable for a year; don't override that. |
| Network | HTTP/3 (QUIC) | **On** | Faster on poor mobile connections — important for many congregations. |
| Network | IP Geolocation | Off | Not needed; less data collected about visitors. |

### One recommended WAF rule (protects the staff area)

**Security → WAF → Custom rules → Create rule**

* Name: `Rate-limit staff sign-in`
* Expression: `(http.request.uri.path contains "/session")`
* Action: **Managed Challenge**

This adds a challenge in front of the login endpoint, on top of the
application's own rate limiting.

---

## Part 5 — Verify everything works

| Check | Expected |
| ----- | -------- |
| Visit `https://penuelpentecostalchurch.org` | Site loads over HTTPS with a padlock |
| Send a message via the Contact page | You get a reference code |
| Visit `https://penuelpentecostalchurch.org/#/office-7f3a91/sign-in` | Sign-in screen |
| Sign in with your seeded account | Staff dashboard, with your message in it |
| Visit `/#/office-7f3a91` in a private window | Redirects to sign-in |
| <https://securityheaders.com> | Grade **A** or **A+** |

---

## Part 6 — Day-to-day use

**To reach the staff area:** bookmark
`https://penuelpentecostalchurch.org/#/office-7f3a91/sign-in`.
It is deliberately not linked anywhere on the public site.

**From the staff dashboard you can:**
* read, mark-as-read and delete messages sent through the website,
* add, edit and delete **Recent Sermons**,
* add, edit and delete **Upcoming Events**,
* add, edit and delete **Announcements**.

Changes appear on the public home page immediately.

---

## Tightening the CSP (optional, recommended later)

The build currently inlines all JavaScript into `index.html`, which forces
`'unsafe-inline'` in the Content-Security-Policy. To remove it:

1. Edit `vite.config.ts` and delete `viteSingleFile()` from the plugins array.
2. In `public/_headers`, change `script-src 'self' 'unsafe-inline'` to
   `script-src 'self'`.
3. Redeploy.

This also enables per-route code-splitting, making the site faster still.

---

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Contact form: "Unable to reach the server" | `ALLOWED_ORIGINS` doesn't match your domain exactly | Check for a trailing slash or missing `www` |
| Contact form blocked in the browser console | `connect-src` in `_headers` doesn't list your API domain | Add it, redeploy |
| Sign-in always fails | `ADMIN_API_PATH` on Render ≠ `admin-api-path` meta tag | Make them identical |
| First request takes 30 s | Render free tier woke from sleep | Normal; add an uptime pinger |
| `P1001: Can't reach database` | Neon auto-suspended, or wrong URL | Retry; verify `DATABASE_URL` |
| Migrations fail on deploy | `DIRECT_DATABASE_URL` missing | Add the non-pooled URL |
| Locked out of the admin account | 8 failed attempts | Wait 15 minutes |

---

## If a secret is ever exposed

1. Rotate `JWT_SECRET` on Render → every session is invalidated instantly.
2. Reset the Neon database password and update both URLs.
3. Change `ADMIN_API_PATH`, update the meta tag, redeploy.
4. Review **Records → audit_logs** in the staff area for unexpected actions.
