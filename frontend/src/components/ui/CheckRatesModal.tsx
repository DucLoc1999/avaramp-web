import { X, CircleDollarSign, Gem, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface RateData {
  created_at: string;
  buy: number;
  sell: number;
  fee_rate_buy: number;
  fee_rate_sell: number;
  min_fee_vnd: number;
}

interface CheckRatesModalProps {
  open: boolean;
  onClose: () => void;
}

interface P2PRatesResponse {
  our: {
    usdt: RateData;
    avax: RateData;
  };
}

export function CheckRatesModal({ open, onClose }: CheckRatesModalProps) {
  const { t } = useTranslation();
  const [usdtRate, setUsdtRate] = useState<RateData | null>(null);
  const [avaxRate, setAvaxRate] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    const baseUrl = import.meta.env.VITE_BASE_URL as string;

    try {
      const res = await fetch(`${baseUrl}/landing/p2p-rates`);

      if (res.status === 401) {
        setError(t("checkRates.unauthorized"));
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(t("checkRates.fetchError"));
        setLoading(false);
        return;
      }

      const data: P2PRatesResponse = await res.json();

      setUsdtRate(data.our.usdt);
      setAvaxRate(data.our.avax);
    } catch (err) {
      console.error("[CheckRatesModal] error:", err);
      setError(t("checkRates.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRates();
    }
  }, [open]);

  if (!open) return null;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-linear-to-r from-blue-600 to-cyan-500 p-5 dark:border-slate-700">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
            <CircleDollarSign className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {t("checkRates.title")}
            </h2>
            <p className="text-xs text-blue-100">{t("checkRates.subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
              <span className="text-sm">{t("checkRates.loading")}</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center dark:border-rose-900/40 dark:bg-rose-900/20">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchRates}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t("checkRates.retry")}
              </button>
            </div>
          )}

          {!loading && !error && usdtRate && avaxRate && (
            <div className="space-y-4">
              {/* USDT Rates */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                    <CircleDollarSign className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    USDT
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("checkRates.buyRate")}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(usdtRate.buy)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("checkRates.sellRate")}
                    </span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {formatVND(usdtRate.sell)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-500">
                        {t("checkRates.feeRate")}
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {(usdtRate.fee_rate_buy * 100).toFixed(2)}% /{" "}
                        {(usdtRate.fee_rate_sell * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AVAX Rates */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
                    <Gem className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    AVAX
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("checkRates.buyRate")}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatVND(avaxRate.buy)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t("checkRates.sellRate")}
                    </span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      {formatVND(avaxRate.sell)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 dark:text-slate-500">
                        {t("checkRates.feeRate")}
                      </span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {(avaxRate.fee_rate_buy * 100).toFixed(2)}% /{" "}
                        {(avaxRate.fee_rate_sell * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <p className="font-medium">{t("checkRates.lastUpdate")}</p>
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  {formatTime(usdtRate.created_at)}
                </p>
                <p className="mt-2 text-[11px] text-blue-600/80 dark:text-blue-400/80">
                  {t("checkRates.disclaimer")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
