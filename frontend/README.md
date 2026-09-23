# AvaRamp — frontend (SPA)

A crypto **on/off** web app for buying and selling **AVAX** and **USDT**
with **VND** (Vietnamese Dong), built as a React single-page application.

It combines a marketing landing page with a full swap/buy/sell flow: users sign
in with Google, compare live rates against major P2P exchanges, and complete
bank or crypto wallet transactions backed by the channel backend.

> This package is the `frontend` workspace of the `stellar-ramp` monorepo. The
> `backend` workspace serves this SPA and the API on the same origin, and acts
> as the web channel's partner agent toward `payment_svc`. Run commands from the
> repo root with `-w @avarampl/frontend` (or use the root scripts).

## Features

- **Landing page** — hero, features, how-it-works, live rate comparison, FAQ, user feedback, and final CTA sections.
- **Authenticated ramp** — Google Sign-In session, `Rates`, `Check rates`, `Settings`, and `Contact support` modals.
- **Buy/sell swap** — buy or sell USDT with VND, with fee calculation and progress tracking.
- **Live market comparison** — fetches and charts buy/sell rates for Binance, OKX, and Bybit against AvaRamp's own rates.
- **Bank payments** — pay via QR/bank transfer across 40+ Vietnamese banks.
- **Multi-language** — English and Vietnamese with automatic language detection.
- **SEO & legal pages** — terms of service, privacy policy, and a 404 page.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/) with the [Tailwind CSS v4](https://tailwindcss.com/) plugin
- [react-i18next](https://react.i18next.com/) for internationalization
- [Recharts](https://recharts.org/) for rate history charts
- [Embla Carousel](https://www.embla-carousel.com/) for sliders
- [lucide-react](https://lucide.dev/) icons and [motion](https://motion.dev/) animations

> Routing is implemented with a lightweight `history.pushState`-based router in `src/App.tsx` — no react-router dependency.

## Getting started

From the repo root:

```bash
npm install
cp frontend/.env.example frontend/.env.local
npm run dev -w @avarampl/frontend   # Vite dev server on :5173
```

Run the backend too (or the repo-root `npm run dev` runs both) so `/api` and
`/landing` calls resolve. Vite proxies both to `http://localhost:3002` (see
`vite.config.ts`).

The app is served at `http://localhost:5173`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production to `dist/spa/` |
| `npm run preview` | Preview the production build |
| `npm run clean` | Remove the `dist/` output directory |
| `npm run typecheck` | Run TypeScript type checking |

## Same-origin build & secrets

`VITE_BASE_URL` is **empty** by default so every browser call is relative to the
origin that serves the SPA. The backend serves the SPA and its own `/api` routes,
and proxies `/landing/*` + unmatched `/api/*` to `payment_svc` — one origin, no
CORS, no cross-origin gateway coupling.

**No payment secrets ship to the browser.** Order creation and cancellation are
performed by the backend on the user's behalf; the partner app key is held
server-side. There is deliberately no `VITE_PARTNER_APP_KEY`.

## Environment variables

See [`.env.example`](./.env.example):

| Variable | Description |
| --- | --- |
| `VITE_BASE_URL` | Base URL for API calls. Leave empty for same-origin (default). |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID used for Google Sign-In |
| `VITE_AVAX_CHAIN_ID` | Avalanche C-Chain id (`43113` Fuji, `43114` Mainnet) |
| `VITE_AVAX_USDT_CONTRACT` | USDT token contract (blank for native AVAX) |
| `VITE_TELEGRAM_LINK` | Optional Telegram support link |

## Project structure

```
frontend/
├── public/               # Static assets, exchange logos
├── index.html
├── vite.config.ts
└── src/
    ├── components/
    │   ├── layout/       # Site landing layout + ramp header/footer
    │   ├── sections/     # Landing page sections (hero, features, FAQ, ...)
    │   └── ui/           # Modals, comment list, chart, scroll-to-top
    ├── config/           # Vietnamese bank definitions
    ├── locales/          # en / vi translation strings
    ├── pages/            # Index, Login, Ramp, Terms, Privacy, 404
    └── utils/            # session, orders, payment methods, AvaRamp helpers
```

Shared request/response types live in [`../shared/api.ts`](../shared/api.ts)
(`@shared` alias).
