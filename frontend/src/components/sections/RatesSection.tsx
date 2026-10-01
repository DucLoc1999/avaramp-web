import { useState } from "react";
import { Check, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

type Comparison = {
  name: string;
  logo: string;
  isFeatured?: boolean;
  highlightKey: string;
  feeRate: number;
  settlementTime: string;
  avax: { buy: number; sell: number };
  usdc: { buy: number; sell: number };
};

const COMPARISONS: Comparison[] = [
  {
    name: "AvaRamp",
    logo: "/logo.png",
    isFeatured: true,
    highlightKey: "rates.highlightOurs",
    feeRate: 0.005,
    settlementTime: "~20s",
    avax: { buy: 728000, sell: 724500 },
    usdc: { buy: 25410, sell: 25380 },
  },
  {
    name: "Binance P2P",
    logo: "/exchanges/binance.png",
    highlightKey: "rates.highlightBinance",
    feeRate: 0.018,
    settlementTime: "10 - 25 min",
    avax: { buy: 742000, sell: 712000 },
    usdc: { buy: 26030, sell: 24770 },
  },
  {
    name: "Bybit P2P",
    logo: "/exchanges/bybit.png",
    highlightKey: "rates.highlightBybit",
    feeRate: 0.022,
    settlementTime: "15 - 30 min",
    avax: { buy: 745000, sell: 710000 },
    usdc: { buy: 26070, sell: 24730 },
  },
  {
    name: "OKX P2P",
    logo: "/exchanges/okx.png",
    highlightKey: "rates.highlightOkx",
    feeRate: 0.019,
    settlementTime: "10 - 20 min",
    avax: { buy: 741500, sell: 713000 },
    usdc: { buy: 26040, sell: 24760 },
  },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString("vi-VN");
}

export const RatesSection = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState<"avax" | "usdc">("avax");

  return (
    <section
      id="rates"
      className="relative border-t border-white/5 bg-[#0E0F14] py-24"
    >
      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("rates.eyebrow")}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("rates.title")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("rates.description")}
          </p>

          {/* Token toggle */}
          <div className="mt-4 inline-flex rounded-xl border border-white/10 bg-[#1A1B22] p-1">
            <button
              type="button"
              onClick={() => setToken("avax")}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                token === "avax"
                  ? "bg-[#E84142] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("rates.tokenAvax")}
            </button>
            <button
              type="button"
              onClick={() => setToken("usdc")}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                token === "usdc"
                  ? "bg-[#2775CA] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("rates.tokenUsdc")}
            </button>
          </div>
        </div>

        {/* Comparison table — desktop */}
        <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-[#14151B] shadow-2xl sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">{t("rates.colExchange")}</th>
                <th className="px-6 py-4">{t("rates.colBuyRate")}</th>
                <th className="px-6 py-4">{t("rates.colSellRate")}</th>
                <th className="px-6 py-4">{t("rates.colFee")}</th>
                <th className="px-6 py-4">{t("rates.colSpeed")}</th>
                <th className="px-6 py-4 text-right">{t("rates.colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {COMPARISONS.map((item) => {
                const rate = item[token];
                return (
                  <tr
                    key={item.name}
                    className={`transition-colors ${
                      item.isFeatured
                        ? "border-l-4 border-l-[#E84142] bg-linear-to-r from-[#E84142]/10 via-[#E84142]/5 to-transparent font-semibold"
                        : "text-slate-300 hover:bg-white/2"
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1">
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${item.isFeatured ? "text-base text-white" : "text-slate-200"}`}
                            >
                              {item.name}
                            </span>
                            {item.isFeatured && (
                              <span className="rounded-full bg-[#E84142] px-2 py-0.5 text-[10px] font-extrabold text-white">
                                {t("rates.recommended")}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {t(item.highlightKey)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono">
                      <div className="text-sm font-bold text-white sm:text-base">
                        {fmt(rate.buy)} ₫
                      </div>
                      {item.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                          <Check className="h-3 w-3" /> {t("rates.bestRate")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 font-mono">
                      <div className="text-sm font-bold text-white sm:text-base">
                        {fmt(rate.sell)} ₫
                      </div>
                      {item.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                          <Check className="h-3 w-3" /> {t("rates.bestRate")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                          item.isFeatured
                            ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {(item.feeRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {item.isFeatured ? (
                          <Zap className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        )}
                        <span
                          className={
                            item.isFeatured
                              ? "font-bold text-amber-300"
                              : "text-slate-400"
                          }
                        >
                          {item.settlementTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {item.isFeatured ? (
                        <a
                          href={import.meta.env.VITE_TELEGRAM_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#E84142] px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#FF5A5B] active:scale-95"
                        >
                          <span>{t("rates.buyNow")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {t("rates.middleman")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Comparison cards — mobile */}
        <div className="flex flex-col gap-3 sm:hidden">
          {COMPARISONS.map((item) => {
            const rate = item[token];
            return (
              <div
                key={item.name}
                className={`rounded-2xl border p-5 ${
                  item.isFeatured
                    ? "border-[#E84142]/40 bg-linear-to-r from-[#E84142]/10 to-transparent"
                    : "border-white/10 bg-[#14151B]"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1">
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.name}</span>
                      {item.isFeatured && (
                        <span className="rounded-full bg-[#E84142] px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {t("rates.recommended")}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {t(item.highlightKey)}
                    </div>
                  </div>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 px-3 py-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("rates.colBuyRate")}
                    </p>
                    <p className="font-mono text-sm font-bold text-white">
                      {fmt(rate.buy)} ₫
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 px-3 py-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("rates.colSellRate")}
                    </p>
                    <p className="font-mono text-sm font-bold text-white">
                      {fmt(rate.sell)} ₫
                    </p>
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 font-mono font-bold ${
                      item.isFeatured
                        ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {(item.feeRate * 100).toFixed(1)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    {item.isFeatured && (
                      <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                    {item.settlementTime}
                  </span>
                </div>
                {item.isFeatured ? (
                  <a
                    href={import.meta.env.VITE_TELEGRAM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#E84142] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#FF5A5B]"
                  >
                    <span>{t("rates.buyNow")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="text-center text-xs text-slate-400">
                    {t("rates.middleman")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Savings tip */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 text-xs font-medium text-emerald-300 sm:text-sm">
          <span>{t("rates.savingsTip")}</span>
        </div>
      </div>
    </section>
  );
};
