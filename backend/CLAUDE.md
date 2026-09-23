# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
`@avarampl/backend`, the web channel backend for AvaRamp. It is the
successor of the standalone `web-be` service and lives in the `stellar-ramp`
monorepo at `backend/` — together with `frontend/` (the Vite SPA) and `shared/`
(common types).

## Stack

- **Runtime**: Node.js 22+, TypeScript (ES2022, CommonJS output)
- **Web**: Fastify 5
- **DB**: PostgreSQL via Knex 3 (`pg` driver), schema `web-be`
- **Storage**: `@aws-sdk/client-s3` (KYC images)
- **Recognition**: OCR.space (fast path) + Google Gemini (fallback)
- **Static**: `@fastify/static` — serves the built SPA from the same origin
- **Test**: Vitest

## Commands

Run from the repo root unless noted. Workspace scripts run with cwd = `backend/`.

```bash
npm run dev -w @avarampl/backend          # tsx watch — serves on :3002
npm run build -w @avarampl/backend        # tsc → backend/dist
npm start -w @avarampl/backend            # node dist/server.js
npm run typecheck -w @avarampl/backend    # tsc --noEmit
npm test -w @avarampl/backend             # vitest run
npm run migrate -w @avarampl/backend      # knex migrate:latest
npm run move-users-schema -w @avarampl/backend  # one-shot schema move

# Whole repo
npm run dev        # backend + frontend concurrently (concurrently)
npm run build      # SPA → frontend/dist/spa, backend → backend/dist
npm test           # backend test suite
npm run typecheck  # both workspaces
```

No lint/format scripts are configured beyond `tsc`.

## Architecture

This service is **both the web channel's backend and its SPA host**. In
production a single container runs it; it serves the built SPA statically and
the API on one origin, and it is the web channel's **partner agent** toward
`payment_svc`.

**Entrypoint** `src/server.ts` — runs migrations, checks the DB, then
`buildApp()` + listen.

**App factory** `src/app.ts` — registers plugins in order: cors → multipart →
swagger → swaggerUi → errorHandler → routes → `registerWebSurface()`, and runs
migrations on `onReady`.

| Prefix | Route File | Handler File | Auth |
|---|---|---|---|
| `/api/auth` | `routes/authRoutes.ts` | `controllers/authController.ts` | None (Google `id_token`) |
| `/api/me` | `routes/meRoutes.ts` | `controllers/meController.ts` | Bearer JWT (`userAuth`) |
| `/api/users` | `routes/userRoutes.ts` | `controllers/userController.ts` | `Partner-App-Key` |
| `/landing/*`, unmatched `/api/*` | — | `plugins/webSurface.ts` (gateway) | None (forwarded to `payment_svc`) |
| SPA assets + deep links | — | `plugins/webSurface.ts` (`@fastify/static`) | None |

**Layers:**
- `controllers/` — request handlers, delegate to services
- `services/` — business logic (`userService`, `paymentMethodService`,
  `googleAuthService`, `idRecognitionService`, `geminiVisionService`,
  `ocrSpaceService`, `cccdParser`, `s3Service`, `partnerService`,
  `paymentSvcClient`)
- `middlewares/` — `errorHandler`, `userAuth`, `kycCheck`, `partnerAuth`
- `plugins/` — `webSurface` (SPA static serving + `payment_svc` gateway)
- `migrations/` — `001`–`003` (users, payment_methods, user auth fields)
- `scripts/move-users-to-web-be-schema.ts` — one-shot schema move

**API docs** served at `/docs` (Swagger UI).

## SPA serving + gateway (`plugins/webSurface.ts`)

- `@fastify/static` serves the SPA from `SPA_DIST_DIR` (default `../dist/spa`,
  relative to the process cwd; in dev set `../frontend/dist/spa`).
- Local routes are registered **before** `registerWebSurface`, so user routes
  win. `setNotFoundHandler` then either:
  - forwards `/landing/*` and unmatched `/api/*` to `${PAYMENT_SVC_BASE_URL}`
    via `paymentSvcClient.forward` (method/body/query preserved, status/body
    mirrored, **no** partner key), or
  - serves `index.html` for non-API GET deep links.
- `/api/*` responses are therefore always JSON, never the SPA HTML.

## Authentication

### User → Service (Bearer JWT)
`/api/me/*` requires `Authorization: Bearer <jwt>`. JWTs are HS256 signed with
`USER_JWT_SECRET` and carry `sub` (user id), `email`, `kyc_status`. `userAuth`
verifies the signature and TTL; `kycCheck` rejects when `kyc_status !== 'approved'`.

### Partner → Service (Partner-App-Key)
`/api/users/*` requires `Partner-App-Key`. `partnerAuth` validates the key by
calling `payment_svc`'s `GET /api/partners/verify` (via `paymentSvcClient.verifyPartner`)
and attaches the returned partner context. This service does not own partner rows
and does not read `payment_svc`'s database.

## Ownership & boundaries

- This service owns the `web-be` schema (`users`, `payment_methods`). It never
  writes to `payment_svc`'s tables.
- It does **not** implement settlement, webhooks, or admin. Those live in
  `payment_svc`.
- `orders.user_id` in `payment_svc` is an **opaque, channel/partner-scoped id**,
  not a reference to a global user store. For the web channel it is the resolved
  `web-be.users.id`; a self-managed partner (e.g. the telebot) sends its own id.
  There is no FK and `payment_svc` never joins it.

## Partner-agent order flow

This backend holds the partner key server-side and acts on the user's behalf:

- `POST /api/me/orders/deposit` / `POST /api/me/orders/withdraw` resolve the
  user's payment method, then call `payment_svc`'s partner-authenticated
  `/api/orders/deposit` / `/api/orders/withdrawal` with `user_id` =
  `String(req.user.id)` and the server-side partner key.
- `GET /api/me/orders` / `GET /api/me/orders/:id` pass `user_id` so results are
  user-scoped.
- `POST /api/me/orders/:id/cancel` first performs an ownership check
  (`getOrder(id, req.user.id)`); a missing or foreign order returns `404` and the
  cancel is **not** forwarded. On success it forwards `POST /api/orders/:id/cancel`
  with the server-side partner key.

No partner key or payment secret is ever shipped to the browser.

## KYC flow

1. `POST /api/me/kyc` (multipart) uploads `image_front` + `image_back` to S3
   under `kyc/<user_id>_<timestamp>_{front,back}.jpg`.
2. `idRecognitionService` selects a provider via `ID_RECOGNITION_PROVIDER`
   (`hybrid` default): OCR.space first, Gemini fallback. `hybrid` does not fall
   back on `NotIdCardError` (that is surfaced to the caller).
3. Recognized fields are written to the user row; `kyc_status` becomes
   `approved`, `kyc_verified_at` is set.

## DB

`src/db.ts` — shared Knex singleton, schema `web-be` (test env uses in-memory
sqlite). Import as `import db from '../db'`. Services use unqualified table
names resolved through the connection `searchPath`.

## Env

See `.env.example`. Notable: `USER_JWT_SECRET`, `GOOGLE_*`, `GOOGLE_AI_API_KEY`,
`OCR_SPACE_*`, `ID_RECOGNITION_PROVIDER`, `AWS_*`, `DB_SCHEMA=web-be`,
`SPA_DIST_DIR`, `PAYMENT_SVC_BASE_URL`, `PAYMENT_SVC_PARTNER_APP_KEY`,
`PAYMENT_SVC_TIMEOUT_MS`.

## Error schema

All errors use the shared shape with an `X-Trace-ID` header:

```json
{
  "success": false,
  "error": { "code": "MACHINE_CODE", "message": "...", "retriable": true, "trace_id": "req-123" }
}
```

## tsconfig

`module: "commonjs"` + `moduleResolution: "node"`. Build output to `dist/`.
`package.json` must keep `"type": "commonjs"`.
