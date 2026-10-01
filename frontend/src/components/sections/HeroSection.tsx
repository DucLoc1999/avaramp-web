import {
  Send,
  Globe,
  ShieldCheck,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  Building2,
  Zap,
  QrCode,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AllRatesResponse, OurRate } from "@shared/api";

const BOT_URL = import.meta.env.VITE_TELEGRAM_LINK || "";

const CACHE_TTL = 60_000;
const clientCache = new Map<
  string,
  { data: AllRatesResponse; expiresAt: number }
>();

const API_BASE = import.meta.env.VITE_BASE_URL || "";

type Token = "USDT" | "AVAX";

const VND_PRESETS = [500000, 1000000, 2000000, 5000000, 10000000];

async function fetchRates(): Promise<AllRatesResponse | null> {
  const url = `${API_BASE}/landing/p2p-rates`;
  const cached = clientCache.get(url);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: AllRatesResponse = await res.json();
    clientCache.set(url, { data, expiresAt: Date.now() + CACHE_TTL });
    return data;
  } catch {
    return null;
  }
}

export const HeroSection = () => {
  const { t } = useTranslation();
  const [usdtRates, setUsdtRates] = useState<OurRate | null>(null);
  const [avaxRates, setAvaxRates] = useState<OurRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [token, setToken] = useState<Token>("USDT");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [payInput, setPayInput] = useState("");
  const [receiveInput, setReceiveInput] = useState("");
  const [inputSide, setInputSide] = useState<"pay" | "receive">("pay");
  const [progress, setProgress] = useState(100);
  const lastFetchRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await fetchRates();
      if (!cancelled) {
        setUsdtRates(data?.our.usdt ?? null);
        setAvaxRates(data?.our.avax ?? null);
        setLoading(false);
        lastFetchRef.current = Date.now();
        setProgress(100);
      }
    }

    load();
    const interval = setInterval(load, CACHE_TTL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastFetchRef.current;
      setProgress(Math.max(0, (1 - elapsed / CACHE_TTL) * 100));
    }, 250);
    return () => clearInterval(tick);
  }, []);

  const secondsLeft = Math.ceil((progress / 100) * 60);
  const fmt4 = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  const parse = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  const fmtVnd = (n: number) => n.toLocaleString("vi-VN");

  const calcFee = (vnd: number, rate: number, minFee: number) =>
    vnd > 0 ? Math.max(vnd * rate, minFee) : 0;

  const rates = token === "USDT" ? usdtRates : avaxRates;

  const feeRateBuy = rates?.fee_rate_buy ?? 0.008;
  const feeRateSell = rates?.fee_rate_sell ?? 0.008;
  const minFeeVnd = rates?.min_fee_vnd ?? 0;
  const feeRate = mode === "buy" ? feeRateBuy : feeRateSell;

  let displayPay = "";
  let displayReceive = "";
  let appliedFee = 0;

  if (rates) {
    if (inputSide === "pay") {
      const payNum = parse(payInput);
      if (payNum > 0) {
        if (mode === "buy") {
          appliedFee = calcFee(payNum, feeRateBuy, minFeeVnd);
          displayReceive = fmt4((payNum - appliedFee) / rates.buy);
          displayPay = payInput;
        } else {
          const vnd = payNum * rates.sell;
          appliedFee = calcFee(vnd, feeRateSell, minFeeVnd);
          displayReceive = (vnd - appliedFee).toLocaleString("vi-VN");
          displayPay = payInput;
        }
      }
    } else {
      const receiveNum = parse(receiveInput);
      if (receiveNum > 0) {
        if (mode === "buy") {
          const vndCase1 = (receiveNum * rates.buy) / (1 - feeRateBuy);
          const vndToPay =
            vndCase1 * feeRateBuy >= minFeeVnd
              ? vndCase1
              : receiveNum * rates.buy + minFeeVnd;
          appliedFee = calcFee(vndToPay, feeRateBuy, minFeeVnd);
          displayPay = fmtVnd(Math.round(vndToPay));
          displayReceive = receiveInput;
        } else {
          const assetCase1 = receiveNum / (rates.sell * (1 - feeRateSell));
          const assetToSell =
            assetCase1 * rates.sell * feeRateSell >= minFeeVnd
              ? assetCase1
              : (receiveNum + minFeeVnd) / rates.sell;
          appliedFee = calcFee(assetToSell * rates.sell, feeRateSell, minFeeVnd);
          displayPay = fmt4(assetToSell);
          displayReceive = receiveInput;
        }
      }
    }
  }

  const feeDisplay =
    appliedFee > 0 ? fmtVnd(Math.round(appliedFee)) : "";
  const currentRate = mode === "buy" ? rates?.buy : rates?.sell;

  const resetInputs = () => {
    setPayInput("");
    setReceiveInput("");
    setInputSide("pay");
  };

  const handleMode = (next: "buy" | "sell") => {
    setMode(next);
    resetInputs();
  };

  const handleSwap = () => handleMode(mode === "buy" ? "sell" : "buy");

  const handleSelectToken = (next: Token) => {
    setToken(next);
    setTokenDropdownOpen(false);
    resetInputs();
  };

  const handlePreset = (val: number) => {
    setInputSide("pay");
    setPayInput(val.toString());
  };

  // Pay side unit: buy → VND, sell → token. Receive side is the inverse.
  const payUnit = mode === "buy" ? "VND" : token;
  const receiveUnit = mode === "buy" ? token : "VND";

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-[#E84142]/15 via-rose-600/10 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute top-10 right-10 -z-10 h-96 w-96 rounded-full bg-red-900/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#E84142] shadow-sm">
              <span className="h-2 w-2 animate-ping rounded-full bg-[#E84142]" />
              <span>{t("hero.badgeNew")}</span>
            </div>

            <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl">
              {t("hero.headlinePre")}
              <span className="bg-gradient-to-r from-[#E84142] via-rose-500 to-amber-400 bg-clip-text text-transparent">
                {t("hero.headlineHighlight")}
              </span>
              {t("hero.headlinePost")}
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-300 lg:mx-0 sm:text-lg">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <a
                href={BOT_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-slate-800 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:border-white/30 hover:bg-slate-700 active:scale-[0.98]"
              >
                <Send className="h-4 w-4 text-sky-400" />
                <span>{t("hero.ctaTelegram")}</span>
              </a>
              <a
                href="/ramp"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-slate-200 transition-all hover:border-white/20 hover:bg-white/10"
              >
                <Globe className="h-4 w-4 text-[#E84142]" />
                <span>{t("hero.ctaWebsite")}</span>
              </a>
            </div>

            {/* Trust stats bento */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-xs text-slate-400">
                  {t("hero.statSettlementLabel")}
                </div>
                <div className="mt-0.5 text-base font-extrabold text-white sm:text-lg">
                  {t("hero.statSettlementVal")}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-xs text-slate-400">
                  {t("hero.statFeeLabel")}
                </div>
                <div className="mt-0.5 text-base font-extrabold text-[#E84142] sm:text-lg">
                  {t("hero.statFeeVal")}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-xs text-slate-400">
                  {t("hero.statSuccessLabel")}
                </div>
                <div className="mt-0.5 text-base font-extrabold text-emerald-400 sm:text-lg">
                  {t("hero.statSuccessVal")}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <div className="text-xs text-slate-400">
                  {t("hero.statVolumeLabel")}
                </div>
                <div className="mt-0.5 text-base font-extrabold text-white sm:text-lg">
                  {t("hero.statVolumeVal")}
                </div>
              </div>
            </div>

            {/* Supported rails */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400 lg:justify-start">
              <span className="font-semibold text-slate-300">
                {t("hero.railsLabel")}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {["VietQR", "Vietcombank", "Techcombank", "MB Bank", "Visa / Mastercard"].map(
                  (rail) => (
                    <span
                      key={rail}
                      className="rounded border border-white/10 bg-white/5 px-2 py-1 font-bold text-slate-200"
                    >
                      {rail}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Ramp Widget */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#131418] p-5 text-slate-100 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-[#E84142]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#E84142]/10 blur-3xl" />

              {/* Buy / Sell tabs */}
              <div className="relative mb-5 flex rounded-xl border border-white/5 bg-[#1C1D24] p-1">
                <button
                  onClick={() => handleMode("buy")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
                    mode === "buy"
                      ? "bg-[#E84142] text-white shadow-md shadow-[#E84142]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t("hero.buyTab")}</span>
                </button>
                <button
                  onClick={() => handleMode("sell")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
                    mode === "sell"
                      ? "bg-[#E84142] text-white shadow-md shadow-[#E84142]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{t("hero.sellTab")}</span>
                </button>
              </div>

              {/* PAY SECTION */}
              <div className="rounded-xl border border-white/5 bg-[#1A1B22] p-4 transition-all hover:border-white/15">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{t("hero.youPay")}</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {t("hero.liveIn", { seconds: secondsLeft })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputSide === "pay" ? payInput : displayPay}
                    onChange={(e) => {
                      setPayInput(e.target.value);
                      setInputSide("pay");
                    }}
                    placeholder="0.00"
                    className="w-full bg-transparent font-mono text-2xl font-extrabold tracking-tight text-white outline-none placeholder-slate-600 sm:text-3xl"
                  />
                  <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#242630] px-3 py-2 text-xs font-bold">
                    {payUnit === "VND" ? "🇻🇳 VND" : payUnit}
                  </span>
                </div>

                {/* Presets (VND amounts, buy mode) */}
                {mode === "buy" && (
                  <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {VND_PRESETS.map((val) => (
                      <button
                        key={val}
                        onClick={() => handlePreset(val)}
                        className="whitespace-nowrap rounded-md border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:bg-white/10"
                      >
                        {val / 1000000 >= 1
                          ? `${val / 1000000}M đ`
                          : `${val / 1000}k đ`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP FLIP */}
              <div className="relative z-10 -my-2.5 flex justify-center">
                <button
                  onClick={handleSwap}
                  className="rounded-full border-4 border-[#131418] bg-[#242630] p-2.5 text-slate-300 shadow-lg transition-all hover:bg-[#E84142] hover:text-white active:scale-95"
                  aria-label="Swap buy/sell"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>

              {/* RECEIVE SECTION */}
              <div className="rounded-xl border border-white/5 bg-[#1A1B22] p-4 transition-all hover:border-white/15">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>{t("hero.youReceive")}</span>
                  <span className="text-[11px]">
                    Network:{" "}
                    <span className="font-semibold text-[#E84142]">
                      Avalanche C-Chain
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={inputSide === "receive" ? receiveInput : displayReceive}
                    onChange={(e) => {
                      setReceiveInput(e.target.value);
                      setInputSide("receive");
                    }}
                    placeholder={loading ? "…" : "0.00"}
                    disabled={loading}
                    className="w-full bg-transparent font-mono text-2xl font-extrabold tracking-tight text-white outline-none placeholder-slate-600 disabled:opacity-50 sm:text-3xl"
                  />

                  {/* Token selector (only meaningful on crypto side) */}
                  {receiveUnit === "VND" ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#242630] px-3 py-2 text-xs font-bold">
                      🇻🇳 VND
                    </span>
                  ) : (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setTokenDropdownOpen((o) => !o)}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#242630] px-3 py-2 text-xs font-bold transition-colors hover:bg-[#2C2E3B]"
                      >
                        <span>{token}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                      {tokenDropdownOpen && (
                        <div
                          className="absolute right-0 z-30 mt-2 w-40 rounded-xl border border-white/10 bg-[#1C1D24] p-1.5 shadow-2xl"
                          onMouseLeave={() => setTokenDropdownOpen(false)}
                        >
                          {(["USDT", "AVAX"] as Token[]).map((tk) => (
                            <button
                              key={tk}
                              onClick={() => handleSelectToken(tk)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                                token === tk
                                  ? "bg-[#E84142]/20 text-white"
                                  : "text-slate-300 hover:bg-white/5"
                              }`}
                            >
                              <span>{tk}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {currentRate ? (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      1 {token} ≈ {currentRate.toLocaleString("vi-VN")} VND
                    </span>
                    <span
                      className={`font-medium ${mode === "buy" ? "text-emerald-400" : "text-[#FF5A5B]"}`}
                    >
                      {mode === "buy" ? t("hero.buy") : t("hero.sell")}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-slate-500">
                    {t("hero.rateUnavailable")}
                  </div>
                )}
              </div>

              {/* Refresh progress */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {t("hero.nextRefresh")}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {secondsLeft}s
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#E84142]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* FEE & SETTLEMENT SUMMARY */}
              <div className="mt-4 space-y-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{t("hero.rateLabel")}</span>
                  <span className="font-mono text-slate-200">
                    {currentRate
                      ? `1 ${token} = ${currentRate.toLocaleString("vi-VN")} VND`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t("hero.feeLabel")}</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {feeDisplay || "0"} ₫ ({(feeRate * 100).toFixed(1)}%
                    {minFeeVnd > 0 ? `, min ${fmtVnd(minFeeVnd)} ₫` : ""})
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t("hero.networkFeeLabel")}</span>
                  <span className="font-mono text-slate-300">
                    {t("hero.networkFeeVal")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t("hero.speedLabel")}</span>
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {t("hero.speedVal")}
                  </span>
                </div>
              </div>

              {/* PRIMARY ACTION */}
              <a
                href="/ramp"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E84142] to-[#FF5A5B] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E84142]/30 transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <QrCode className="h-4 w-4" />
                <span>
                  {mode === "buy"
                    ? t("hero.buyAction", { token })
                    : t("hero.sellAction", { token })}
                </span>
              </a>

              {/* Trust footer */}
              <div className="mt-3.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {t("hero.nonCustodial")}
                </span>
                <span className="text-slate-500">•</span>
                <span>{t("hero.vietQrFree")}</span>
                <span className="text-slate-500">•</span>
                <span>{t("hero.zeroSlippage")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
