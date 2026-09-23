# @avarampl/backend — AvaRamp web channel backend

The web channel backend for **AvaRamp**. It owns everything about an end
user — Google sign-in, profile, KYC ID-card recognition, and payment methods —
serves the built SPA on the same origin, and acts as the web channel's
**partner agent** toward `payment_svc`.

It is the successor of the standalone `web-be` service and now lives in the
`stellar-ramp` monorepo at `backend/`, next to `frontend/` (the Vite SPA) and
`shared/` (common types). In production a single container runs it and serves
the SPA + API on one origin (`:3002`).

## Responsibilities

- **SPA host + gateway** — serves the built SPA from `SPA_DIST_DIR` with history
  fallback, and forwards `/landing/*` + unmatched `/api/*` to `payment_svc`.
- **Auth** — exchange a Google `id_token` for a service JWT (`/api/auth/google`).
- **Profile** — `GET /api/me` returns the authenticated user (KYC image columns stripped).
- **KYC** — `POST /api/me/kyc` accepts CCCD front/back photos, runs hybrid
  OCR.space + Gemini recognition, stores the images in S3, and sets
  `kyc_status=approved`.
- **Payment methods** — CRUD under `/api/me/payment-methods` (`BANK` / `CRYPTO`).
- **Partner user API** — `/api/users/*` (partner-authenticated KYC + user lookup).
- **Orders (partner agent)** — `/api/me/orders/*` resolves the user's payment
  method and forwards to `payment_svc`'s partner-authenticated `/api/orders/*`
  using the server-side partner key, with `user_id` set to the web user id.
  Cancels are ownership-checked before forwarding.

## Tech stack

- Node.js 22+ / TypeScript (CommonJS output)
- Fastify 5 + `@fastify/static`
- PostgreSQL via Knex 3 (`pg`)
- `@aws-sdk/client-s3` for KYC image storage
- OCR.space + Google Gemini for ID recognition
- Vitest

## Getting started

From the repo root:

```bash
npm install
cp backend/.env.example backend/.env
npm run dev -w @avarampl/backend   # tsx watch, serves on :3002
```

To run the SPA against it, also start `npm run dev -w @avarampl/frontend`
(or just `npm run dev` at the repo root to run both).

### Database

This service owns the `web-be` schema (`users`, `payment_methods`) in the same
Postgres instance as `payment_svc`. Migrations run in-process on startup; you
can also run them manually:

```bash
npm run migrate -w @avarampl/backend
```

Knex doesn't auto-load `.env`, so pass env vars explicitly if running the CLI
against a non-default database.

**Existing deployments** that already have `avaramp.users` /
`avaramp.payment_methods` should move them once:

```bash
SOURCE_SCHEMA=avaramp TARGET_SCHEMA=web-be npm run move-users-schema -w @avarampl/backend
```

### Partner-App-Key

This backend does not read `payment_svc`'s database. It verifies partner keys by
calling `payment_svc`'s `GET /api/partners/verify` endpoint, so no cross-schema
grant is needed. Its own partner key is held server-side (never in the browser).

## Environment

See [`.env.example`](./.env.example). Key groups:

| Group | Variables |
|---|---|
| HTTP | `PORT`, `HOST`, `FRONTEND_ORIGIN`, `LOG_LEVEL` |
| SPA | `SPA_DIST_DIR` |
| User auth | `USER_JWT_SECRET`, `USER_JWT_EXPIRES_SEC`, `GOOGLE_CLIENT_ID`, `GOOGLE_WEB_CLIENT_ID` |
| KYC recognition | `ID_RECOGNITION_PROVIDER`, `GOOGLE_AI_API_KEY`, `GEMINI_MODEL`, `OCR_SPACE_*` |
| KYC storage | `AWS_S3_*`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| DB | `DB_*`, `DB_SCHEMA=web-be` |
| payment_svc | `PAYMENT_SVC_BASE_URL`, `PAYMENT_SVC_PARTNER_APP_KEY`, `PAYMENT_SVC_TIMEOUT_MS` |

## The `payment_svc` partner agent

This backend does not implement settlement. For the order routes it:

1. resolves the authenticated user's payment method from `web-be.payment_methods`,
2. derives `recipient` (CRYPTO) or `payment_info` (BANK),
3. calls `payment_svc`'s V1 `/api/orders/deposit` / `/api/orders/withdrawal`
   with `Partner-App-Key` and `user_id` = the authenticated web user's id,
4. mirrors the upstream status code and body back to the client.

List/get are scoped with `user_id`. Cancel performs an ownership check via the
user-scoped order lookup first, then forwards `POST /api/orders/:id/cancel`.

## API

| Prefix | Auth | Purpose |
|---|---|---|
| `/api/auth` | None | Google OAuth login |
| `/api/me` | Bearer JWT | Profile, KYC, payment methods, orders |
| `/api/users` | `Partner-App-Key` | Partner-facing KYC + user lookup |
| `/landing/*`, unmatched `/api/*` | None | Forwarded to `payment_svc` |
| `/health` | None | Liveness |

Interactive docs at `/docs` (Swagger UI).

## Deployment

- **Docker**: the **root** multi-stage `Dockerfile` builds the SPA and this
  backend into one image that serves both on `:3002`; see the repo-root
  `docker-compose.yml` / `docker-compose.local.yml`.
- **PM2**: the root `ecosystem.config.js` (`avarampl` app, cwd `backend/`).
- Cross-server: set `PAYMENT_SVC_BASE_URL` to `payment_svc`'s reachable URL. For
  co-located local dev, use `http://host.docker.internal:3001`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run migrate` | Apply Knex migrations |
| `npm run move-users-schema` | One-shot move of user tables into `web-be` |
| `npm test` | Run Vitest |
