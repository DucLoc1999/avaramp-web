import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RampHeader } from "../components/layout/RampHeader";
import { RampFooter } from "../components/layout/RampFooter";
import { SettingsModal } from "../components/ui/SettingsModal";
import type { Tab as SettingsTab } from "../components/ui/SettingsModal";
import { CheckRatesModal } from "../components/ui/CheckRatesModal";
import { ContactSupportModal } from "../components/ui/ContactSupportModal";
import { BuySellFlowModal } from "../components/ui/BuySellFlowModal";
import type { AssetType } from "../components/ui/BuySellFlowModal";
import { getSession, handleUnauthorized } from "../utils/session";
import { listPaymentMethods } from "../utils/paymentMethods";
import type { AllRatesResponse, OurRate, PaymentMethod } from "@shared/api";

interface MeData {
  id: number;
  id_number?: string | null;
  name?: string | null;
  dob?: string | null;
  sex?: string | null;
  nationality?: string | null;
  home?: string | null;
  address?: string | null;
  doe?: string | null;
  phone?: string | null;
  email?: string | null;
  kyc_status?: string | null;
  kyc_verified_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RampPageProps {
  onLogout: () => void;
}

const CACHE_TTL = 60_000;
const API_BASE = import.meta.env.VITE_BASE_URL || "";

async function fetchRates(): Promise<AllRatesResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/landing/p2p-rates`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function RampPage({ onLogout }: RampPageProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("account");
  const [meData, setMeData] = useState<MeData | null>(null);
  const [meLoading, setMeLoading] = useState(false);

  const [checkRatesOpen, setCheckRatesOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [buySellOpen, setBuySellOpen] = useState(false);
  const [buySellAsset, setBuySellAsset] = useState<AssetType>("USDT");

  // Swap interface state
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [asset, setAsset] = useState<AssetType>("USDT");
  const [payInput, setPayInput] = useState("");
  const [receiveInput, setReceiveInput] = useState("");
  const [inputSide, setInputSide] = useState<"pay" | "receive">("pay");
  const [usdtRates, setUsdtRates] = useState<OurRate | null>(null);
  const [avaxRates, setAvaxRates] = useState<OurRate | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [progress, setProgress] = useState(100);
  const [feeDisplay, setFeeDisplay] = useState("");
  const lastFetchRef = useRef<number>(Date.now());

  const fetchMeData = () => {
    const session = getSession();
    if (!session?.token) return;

    const baseUrl = import.meta.env.VITE_BASE_URL as string;
    fetch(`${baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return null;
        }
        return res.json();
      })
      .then((body) => {
        if (!body) return;
        if (body?.success && body?.data) {
          setMeData(body.data as MeData);
        }
      })
      .catch((err) => console.error("[/api/me] error:", err));
  };

  const fetchPaymentMethods = () => {
    listPaymentMethods()
      .then((methods) => setPaymentMethods(methods))
      .catch((err) => console.error("[/api/me/payment-methods] error:", err));
  };

  useEffect(() => {
    fetchMeData();
    fetchPaymentMethods();
  }, []);

  // Fetch rates
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setRatesLoading(true);
      const data = await fetchRates();
      if (!cancelled) {
        setUsdtRates(data?.our.usdt ?? null);
        setAvaxRates(data?.our.avax ?? null);
        setRatesLoading(false);
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

  // Progress bar
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastFetchRef.current;
      setProgress(Math.max(0, (1 - elapsed / CACHE_TTL) * 100));
    }, 250);
    return () => clearInterval(tick);
  }, []);

  const rates = asset === "USDT" ? usdtRates : avaxRates;
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

  // Compute conversion
  useEffect(() => {
    if (!rates) {
      setReceiveInput("");
      setFeeDisplay("");
      return;
    }

    const feeRateBuy = rates.fee_rate_buy ?? 0.008;
    const feeRateSell = rates.fee_rate_sell ?? 0.008;
    const minFeeVnd = rates.min_fee_vnd ?? 0;

    if (inputSide === "pay") {
      const payNum = parse(payInput);
      if (payNum > 0) {
        if (mode === "buy") {
          const appliedFee = calcFee(payNum, feeRateBuy, minFeeVnd);
          const receive = (payNum - appliedFee) / rates.buy;
          setReceiveInput(fmt4(receive));
          setFeeDisplay(appliedFee > 0 ? `${fmtVnd(Math.round(appliedFee))} ₫` : "");
        } else {
          const assetAmount = payNum;
          const vnd = assetAmount * rates.sell;
          const appliedFee = calcFee(vnd, feeRateSell, minFeeVnd);
          setReceiveInput((vnd - appliedFee).toLocaleString("vi-VN"));
          setFeeDisplay(appliedFee > 0 ? `${fmtVnd(Math.round(appliedFee))} ₫` : "");
        }
      } else {
        setReceiveInput("");
        setFeeDisplay("");
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
          const appliedFee = vndToPay - receiveNum * rates.buy;
          setPayInput(fmtVnd(Math.round(vndToPay)));
          setFeeDisplay(appliedFee > 0 ? `${fmtVnd(Math.round(appliedFee))} ₫` : "");
        } else {
          const assetCase1 = receiveNum / (rates.sell * (1 - feeRateSell));
          const assetToSell =
            assetCase1 * rates.sell * feeRateSell >= minFeeVnd
              ? assetCase1
              : (receiveNum + minFeeVnd) / rates.sell;
          const vndValue = assetToSell * rates.sell;
          const appliedFee = calcFee(vndValue, feeRateSell, minFeeVnd);
          setPayInput(fmt4(assetToSell));
          setFeeDisplay(appliedFee > 0 ? `${fmtVnd(Math.round(appliedFee))} ₫` : "");
        }
      } else {
        setPayInput("");
        setFeeDisplay("");
      }
    }
  }, [payInput, receiveInput, inputSide, rates, mode]);

  const handleTrade = () => {
    setBuySellAsset(asset);
    setBuySellOpen(true);
  };

  const handleGoToKyc = () => {
    setSettingsTab("kyc");
    setSettingsOpen(true);
  };

  const handleGoToBank = () => {
    setSettingsTab("bank");
    setSettingsOpen(true);
  };

  const handleGoToWallet = () => {
    setSettingsTab("wallet");
    setSettingsOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <RampHeader onLogout={onLogout} onSettings={() => {
        setSettingsTab("account");
        setSettingsOpen(true);
      }} />

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Main Swap Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-20"></div>
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-blue-600 to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">{t("ramp.menuTitle")}</h1>
                  <button
                    onClick={() => setCheckRatesOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {secondsLeft}s
                  </button>
                </div>

                {/* Buy/Sell Toggle */}
                <div className="relative flex rounded-full bg-white/20 p-1 text-sm font-semibold">
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-200 ${
                      mode === "buy"
                        ? "left-1 bg-emerald-500"
                        : "left-[calc(50%+4px)] bg-red-500"
                    }`}
                  />
                  <button
                    onClick={() => {
                      setMode("buy");
                      setPayInput("");
                      setReceiveInput("");
                      setInputSide("pay");
                    }}
                    className={`relative z-10 flex-1 py-2 rounded-full transition-colors ${
                      mode === "buy" ? "text-white" : "text-white/70"
                    }`}
                  >
                    {t("hero.buy")}
                  </button>
                  <button
                    onClick={() => {
                      setMode("sell");
                      setPayInput("");
                      setReceiveInput("");
                      setInputSide("pay");
                    }}
                    className={`relative z-10 flex-1 py-2 rounded-full transition-colors ${
                      mode === "sell" ? "text-white" : "text-white/70"
                    }`}
                  >
                    {t("hero.sell")}
                  </button>
                </div>
              </div>

              {/* Asset Selector */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  {(["USDT", "AVAX"] as AssetType[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setAsset(a);
                        setPayInput("");
                        setReceiveInput("");
                        setInputSide("pay");
                      }}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                        asset === a
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Inputs */}
              <div className="p-6 space-y-4">
                {/* Pay Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {t("hero.youPay")}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {mode === "buy" ? "VND" : asset}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={payInput}
                      onChange={(e) => {
                        setPayInput(e.target.value);
                        setInputSide("pay");
                      }}
                      placeholder="0"
                      className="w-full px-4 py-4 text-2xl font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center -my-2">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <ArrowDownUp className="h-5 w-5" />
                  </div>
                </div>

                {/* Receive Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {t("hero.youReceive")}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {mode === "buy" ? asset : "VND"}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={receiveInput}
                      onChange={(e) => {
                        setReceiveInput(e.target.value);
                        setInputSide("receive");
                      }}
                      placeholder={ratesLoading ? "…" : "0"}
                      disabled={ratesLoading}
                      className="w-full px-4 py-4 text-2xl font-bold text-slate-800 dark:text-slate-100 outline-none bg-transparent disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Fee Display */}
                {rates && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
                    {t("hero.fee")}:{" "}
                    <span className="font-semibold text-slate-500">
                      {feeDisplay || "0"} ₫
                    </span>{" "}
                    ({(((mode === "buy" ? rates.fee_rate_buy : rates.fee_rate_sell) ?? 0.008) * 100).toFixed(1)}%
                    {(rates.min_fee_vnd ?? 0) > 0
                      ? `, min ${fmtVnd(rates.min_fee_vnd ?? 0)} ₫`
                      : ""})
                  </p>
                )}

                {/* Rate Display */}
                {rates && (
                  <div className="pt-2 text-left">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      1 {asset} ={" "}
                      <span
                        className={`font-bold ${mode === "buy" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                      >
                        {(mode === "buy" ? rates.buy : rates.sell).toLocaleString("vi-VN")}
                      </span>{" "}
                      ₫
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!payInput || parse(payInput) <= 0}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  {mode === "buy" ? t("hero.buy") : t("hero.sell")} {asset}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RampFooter onContactSupport={() => setSupportOpen(true)} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        data={meData}
        loading={meLoading}
        onKycSuccess={fetchMeData}
        onPaymentMethodsChanged={fetchPaymentMethods}
        initialTab={settingsTab}
      />

      <CheckRatesModal
        open={checkRatesOpen}
        onClose={() => setCheckRatesOpen(false)}
      />

      <ContactSupportModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />

      <BuySellFlowModal
        open={buySellOpen}
        onClose={() => setBuySellOpen(false)}
        asset={buySellAsset}
        tradeType={mode}
        tokenAmount={mode === "buy" ? receiveInput : payInput}
        vndEstimate={mode === "buy" ? payInput : receiveInput}
        rate={rates}
        feeDisplay={feeDisplay}
        kycStatus={meData?.kyc_status}
        onGoToKyc={handleGoToKyc}
        onGoToBank={handleGoToBank}
        onGoToWallet={handleGoToWallet}
      />
    </div>
  );
}
