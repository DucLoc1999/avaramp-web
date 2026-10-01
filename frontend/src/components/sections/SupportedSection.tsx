import { useState } from "react";
import { Coins, Building2, Wallet, Copy, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { banks } from "../../config/banks";

type Token = {
  symbol: string;
  name: string;
  icon: string;
  priceVnd: number;
  change24h: number;
  contractAddress?: string;
};

const TOKENS: Token[] = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    icon: "https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=040",
    priceVnd: 728000,
    change24h: 4.82,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040",
    priceVnd: 25410,
    change24h: 0.02,
    contractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040",
    priceVnd: 25420,
    change24h: -0.01,
    contractAddress: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  },
  {
    symbol: "BTC.b",
    name: "Bitcoin (Bridged)",
    icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=040",
    priceVnd: 1739314500,
    change24h: 2.15,
    contractAddress: "0x152b9d0FdC40C096757F570A51E494db41938650",
  },
  {
    symbol: "JOE",
    name: "Trader Joe",
    icon: "https://cryptologos.cc/logos/trader-joe-joe-logo.svg?v=040",
    priceVnd: 10670,
    change24h: 7.34,
  },
];

const POPULAR_BANK_IDS = [1, 3, 4, 8, 13, 22, 18, 5, 9, 14];
const POPULAR_BANKS = POPULAR_BANK_IDS.map(
  (id) => banks.find((b) => b.id === id)!,
);

export const SupportedSection = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  const wallets = t("supported.wallets", { returnObjects: true }) as {
    name: string;
    desc: string;
    tag: string;
  }[];

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section
      id="supported"
      className="relative border-t border-white/5 bg-[#0B0C0E] py-24"
    >
      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("supported.eyebrow")}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("supported.title")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("supported.subtitle")}
          </p>
        </div>

        {/* Tokens */}
        <div className="mb-14">
          <div className="mb-6 flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#E84142]" />
            <h3 className="text-lg font-bold text-white">
              {t("supported.tokensHeading")}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOKENS.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-[#14151B] p-5 transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-slate-400">
                        {token.name}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {token.priceVnd.toLocaleString("vi-VN")} ₫
                      <span
                        className={`ml-2 font-semibold ${token.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {token.change24h >= 0
                          ? `+${token.change24h}%`
                          : `${token.change24h}%`}
                      </span>
                    </div>
                  </div>
                </div>
                {token.contractAddress ? (
                  <button
                    type="button"
                    onClick={() => copy(token.contractAddress!, token.symbol)}
                    className="rounded-lg bg-white/5 p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    title={t("supported.copyContract")}
                  >
                    {copied === token.symbol ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="rounded bg-[#E84142]/15 px-2 py-1 text-[10px] font-bold text-[#E84142]">
                    {t("supported.nativeGas")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Banks */}
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#E84142]" />
              <h3 className="text-lg font-bold text-white">
                {t("supported.banksHeading")}
              </h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("supported.napasNote")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {POPULAR_BANKS.map((bank) => (
              <div
                key={bank.id}
                className="group flex flex-col items-center rounded-xl border border-white/5 bg-[#14151B] p-3.5 text-center transition-all hover:border-[#E84142]/30"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1">
                  <img
                    src={bank.image}
                    alt={bank.short_name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-xs font-bold text-white">
                  {bank.short_name}
                </div>
                <div className="mt-0.5 w-full truncate font-mono text-[10px] text-slate-400">
                  BIN: {bank.bin_code}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wallets */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#E84142]" />
            <h3 className="text-lg font-bold text-white">
              {t("supported.walletsHeading")}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wallets.map((w) => (
              <div
                key={w.name}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-[#14151B] p-4"
              >
                <div>
                  <div className="text-sm font-bold text-white">{w.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{w.desc}</div>
                </div>
                <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {w.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
