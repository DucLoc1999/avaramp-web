# AvaRamp — web channel

The AvaRamp **web channel**: a Vite SPA and its backend, deployed together
as a single container. The backend serves the built SPA and the API on the same
origin, and acts as the channel's **partner agent** toward `payment_svc`.

## Layout

```
stellar-ramp/
├── frontend/   # Vite + React SPA (@avarampl/frontend)
├── backend/    # channel backend — ex web-be (@avarampl/backend)
├── shared/     # shared API types (@shared alias)
├── Dockerfile             # single-image build (SPA + backend, :3002)
├── docker-compose.yml     # production single service
├── docker-compose.local.yml
└── ecosystem.config.js    # PM2 entry
```

`frontend` and `backend` are npm workspaces; `shared/` is consumed by the
frontend via the `@shared` alias.

## Develop

```bash
npm install
npm run dev        # backend (:3002) + Vite SPA (:5173) concurrently
```

Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` →
`frontend/.env.local` first. The SPA's `/api` and `/landing` calls proxy to the
local backend, which forwards non-user paths to `payment_svc`
(`PAYMENT_SVC_BASE_URL`).

## Build & test

```bash
npm run build      # SPA → frontend/dist/spa, backend → backend/dist
npm test           # backend Vitest suite
npm run typecheck  # both workspaces
```

## Deploy

```bash
docker compose up -d --build          # production, published on :3002
docker compose -f docker-compose.local.yml up --build   # local
```

One container serves the SPA (with history fallback) and the API on `:3002`.
`/api` 404s stay JSON; deep links fall back to the SPA entry point.

## Boundaries

- `payment_svc` is the frozen payment/order engine; this repo does not change it.
- `orders.user_id` is an **opaque channel-scoped id** — the web channel sends its
  own `web-be.users.id`, a self-managed partner sends its own id. No global user
  store, no FK.
- No partner key or payment secret ships in the browser bundle; the backend holds
  the partner key server-side.

See [`backend/CLAUDE.md`](./backend/CLAUDE.md) and
[`frontend/README.md`](./frontend/README.md) for details.
