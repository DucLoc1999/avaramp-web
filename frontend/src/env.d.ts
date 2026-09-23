/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_AVAX_CHAIN_ID: string;
  readonly VITE_AVAX_USDT_CONTRACT: string;
  readonly VITE_TELEGRAM_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
