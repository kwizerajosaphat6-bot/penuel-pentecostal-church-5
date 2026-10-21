# Pentecostal Penuel Church — Backend

A production-ready Node.js / Express API with a SQLite database, JWT authentication, and hardened HTTP security.

## Quick start (local development)

```bash
cd server
cp .env.example .env               # edit with your own secrets
npm install                        # also runs `prisma generate`
npm run db:push                    # create the SQLite database
npm run db:seed                    # create the first admin + sample content
npm run dev                        # start in watch mode
```

The API listens at `http://127.0.0.1:4000`.

## Production deployment

```bash
NODE_ENV=production npm install
NODE_ENV=production npm run db:push
NODE_ENV=production npm run db:seed
NODE_ENV=production npm start
```

Place nginx (or Caddy) in front of it, pointing `ALLOWED_ORIGIN` at your website.

## What this hides by design

| Concern                  | Where the decision lives                       |
| ------------------------ | ---------------------------------------------- |
| Database engine          | Only `DATABASE_URL` in `.env`; no file paths leak |
| Admin credentials        | `.env` only — never committed, never returned by the API |
| JWT secret               | `.env` only — 256-bit random, rotated manually |
| Error details            | Sanitised in `src/index.js`; real errors log only to stdout |
| Internal paths           | Stripped from every response                   |
| Server software          | `X-Powered-By` removed; no version headers     |
| Rate limits              | `express-rate-limit` with generic messages     |
| CORS                     | One allowed origin only                        |
| HSTS / CSP               | Configured via `helmet` with strict directives |

## API surface

### Public (no auth)

```
GET  /api/sermons
GET  /api/testimonies
GET  /api/services
POST /api/contact
POST /api/prayer
GET  /health
```

### Admin (requires access token)

```
GET    /api/admin/dashboard
GET    /api/admin/messages
PATCH  /api/admin/messages/:id/read
DELETE /api/admin/messages/:id
GET    /api/admin/sermons
POST   /api/admin/sermons
PATCH  /api/admin/sermons/:id
DELETE /api/admin/sermons/:id
GET    /api/admin/testimonies
POST   /api/admin/testimonies
PATCH  /api/admin/testimonies/:id
GET    /api/admin/services
PATCH  /api/admin/services/:id
GET    /api/admin/audit
```

### Auth

```
POST /api/auth/login
POST /api/auth/refresh
```

## Security checklist

- [x] `helmet` with strict CSP, HSTS, no-sniff, referrer-policy, X-Frame-Options
- [x] CORS locked to one frontend origin
- [x] Rate limiting (stricter on login)
- [x] JSON / URL payload cap at 64 KB
- [x] HTTP parameter pollution protection (`hpp`)
- [x] XSS + input sanitisation on every write endpoint
- [x] bcrypt password hashing (12 rounds)
- [x] JWT with short access / long refresh tokens, refresh tokens in DB so a session can be revoked
- [x] Generic error messages — real errors logged, never sent to the client
- [x] SQLite in a single file, no remote DB credentials to leak
- [x] Audit log for every admin action

## Environment variables

See `.env.example` for the full list.
