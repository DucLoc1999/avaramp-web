# AvaRamp — Working Brief

Quick orientation notes. Not exhaustive — we'll dig into details as we go.

## What we're doing

Working in **`avaramp-web/frontend`** (the real, production app). Using
**`avaramp---avalanche-fiat-on_off-ramp`** (an AI Studio prototype, sibling
folder) purely as the **design reference** — visuals, layout, component ideas.

## Target project — `avaramp-web/frontend`

Crypto on/off ramp SPA: buy & sell **AVAX / USDT** with **VND**.

- **Stack**: React 19 + TS, Vite 6, Tailwind v4, react-i18next (en/vi),
  Recharts, Embla, lucide-react, motion, axios.
- **Monorepo**: `frontend` workspace of `stellar-ramp` (`avaramp-web`). Backend
  serves the SPA + API same-origin and acts as partner agent to `payment_svc`.
  Shared types via `@shared` alias (`../shared/api.ts`).
- **Routing**: no react-router — lightweight `history.pushState` router in
  `src/App.tsx`. Routes: `/`, `/login`, `/ramp`, `/terms`, `/privacy`, 404.
- **Auth**: Google Sign-In → `/api/auth/google`, session stored client-side.
- **Security**: no payment secrets in the browser; backend holds partner key.
  `VITE_BASE_URL` empty by default (same-origin).

### Structure
```
src/
├── components/
│   ├── layout/    SiteHeader/Footer, RampHeader/Footer, SiteLayout
│   ├── sections/  Hero, Features, HowItWorks, Rates, Faq, UserFeedback, FinalCta
│   └── ui/        BuySell(Flow)Modal, CheckRatesModal, Settings/ContactSupport, chart
├── config/banks.ts
├── locales/       en.json, vi.json
├── pages/         Index, Login, Ramp, Terms, Privacy, NotFound
└── utils/         session, orders, paymentMethods, banks
```

## Design reference — `avaramp---avalanche-fiat-on_off-ramp`

AI Studio prototype. **Not** wired to a real backend (mock data, Gemini key).
Single-page marketing layout, dark theme.

- **Stack**: React 19, Vite 8, Tailwind v4, motion, lucide-react, `@google/genai`.
  No i18n lib (has vi/en fields on data), no router (single `App.tsx` scroll page).
- **Sections**: Navbar, Hero, RateComparison, Features, HowItWorks,
  SupportedAssets, DeveloperSdk, Testimonials, FaqSection, Footer + OrderModal,
  SupportModal.
- **State**: single `AppContext`, mock data in `src/data/mockData.ts`, rich
  domain types in `src/types.ts` (CryptoToken, RampOrder, ExchangeComparison…).
- **Theme tokens**: AVAX red `#E84142` (dark `#C92A2B`, light `#FF5A5B`),
  near-black bg `#0B0C0E`, subtle grid-pattern background.

## Conventions

- **Bilingual everywhere**: every piece of text we add must be wired through
  react-i18next with both **en** and **vi** entries in `locales/`. No hardcoded
  strings — always add the key to both `en.json` and `vi.json`.

## Notable gaps between the two

- Reference has sections the target lacks: **SupportedAssets**, **DeveloperSdk**.
- Reference uses one `AppContext` + mock data; target uses real API utils + i18n.
- Reference is a single scroll page; target is multi-route with auth-gated `/ramp`.

## Next

Awaiting direction on which piece to port/redesign first.
