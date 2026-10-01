import { useEffect, useRef, useState } from "react";
import {
  X,
  Banknote,
  Gem,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Order, OurRate, PaymentMethod } from "@shared/api";
import { OrderState } from "@shared/api";
import { getBankById, getBankByShortName } from "../../utils/banks";
import { listPaymentMethods } from "../../utils/paymentMethods";
import {
  createDepositOrder,
  createWithdrawOrder,
  getOrder,
  cancelOrder,
} from "../../utils/orders";

export type AssetType = "USDT" | "AVAX";
type TradeType = "buy" | "sell";
type Step = "method" | "confirm" | "payment";

interface BuySellFlowModalProps {
  open: boolean;
  onClose: () => void;
  asset: AssetType;
  tradeType: TradeType;
  /** Token amount from the swap UI */
  tokenAmount: string;
  /** VND estimate from the swap UI */
  vndEstimate: string;
  /** Rate from the swap UI */
  rate: OurRate | null;
  /** Fee display from the swap UI */
  feeDisplay: string;
  kycStatus?: string | null;
  onGoToKyc?: () => void;
  onGoToBank?: () => void;
  onGoToWallet?: () => void;
}

const API_BASE = import.meta.env.VITE_BASE_URL || "";

function formatVND(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function shortenAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function statusKey(state: number): string {
  switch (state) {
    case OrderState.CREATED:
      return "buySellFlowModal.statusCreated";
    case OrderState.PROCESSING:
      return "buySellFlowModal.statusProcessing";
    case OrderState.COMPLETED:
      return "buySellFlowModal.statusCompleted";
    case OrderState.FAILED:
      return "buySellFlowModal.statusFailed";
    case OrderState.CANCELLED:
      return "buySellFlowModal.statusCancelled";
    default:
      return "buySellFlowModal.statusCreated";
  }
}

function statusColor(state: number): string {
  switch (state) {
    case OrderState.COMPLETED:
      return "text-emerald-400";
    case OrderState.FAILED:
    case OrderState.CANCELLED:
      return "text-rose-400";
    case OrderState.PROCESSING:
      return "text-[#FF5A5B]";
    default:
      return "text-amber-400";
  }
}

function isTerminal(state: number): boolean {
  return (
    state === OrderState.COMPLETED ||
    state === OrderState.FAILED ||
    state === OrderState.CANCELLED
  );
}

export function BuySellFlowModal({
  open,
  onClose,
  asset,
  tradeType,
  tokenAmount,
  vndEstimate,
  rate,
  feeDisplay,
  kycStatus,
  onGoToKyc,
  onGoToBank,
  onGoToWallet,
}: BuySellFlowModalProps) {
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("method");

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const [polling, setPolling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chainId = parseInt(
    (import.meta.env.VITE_AVAX_CHAIN_ID as string) || "43113",
    10,
  );
  const usdtContract = (import.meta.env.VITE_AVAX_USDT_CONTRACT as string) || "";

  useEffect(() => {
    if (!open) {
      stopPolling();
      return;
    }
    setStep("method");
    setMethods([]);
    setSelectedMethodId(null);
    setSubmitting(false);
    setSubmitError(null);
    setOrder(null);
    setCancelMsg(null);
    setPolling(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, asset, tradeType]);

  useEffect(() => {
    if (!open || step !== "method") return;
    setMethodsLoading(true);
    setMethodsError(null);
    listPaymentMethods()
      .then((all) => {
        setMethods(all);
        const type = tradeType === "buy" ? "CRYPTO" : "BANK";
        const first = all.find((m) => m.type === type);
        setSelectedMethodId(first?.id ?? null);
      })
      .catch((err) =>
        setMethodsError(err?.message ?? t("buySellFlowModal.error")),
      )
      .finally(() => setMethodsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, tradeType]);

  useEffect(() => {
    if (step === "payment" && order && !isTerminal(order.state)) {
      startPolling(order.id);
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, order?.id]);

  function startPolling(orderId: number) {
    stopPolling();
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const updated = await getOrder(orderId);
        setOrder((prev) => (prev ? { ...prev, state: updated.state } : prev));
        if (isTerminal(updated.state)) {
          stopPolling();
        }
      } catch {
        // swallow
      }
    }, 5000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }

  if (!open) return null;

  if (kycStatus !== "approved") {
    return (
      <ModalShell2 asset={asset} tradeType={tradeType} onClose={onClose}>
        <div className="flex flex-col items-center gap-4 py-10 px-2 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm font-semibold text-slate-200">
            {tradeType === "sell"
              ? t("buySellFlowModal.kycRequiredSell")
              : t("buySellFlowModal.kycRequiredBuy")}
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToKyc?.();
            }}
            className="rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30"
          >
            {t("buySellFlowModal.goToKyc")}
          </button>
        </div>
      </ModalShell2>
    );
  }

  // ── Step: method ──────────────────────────────────────────────────────────
  if (step === "method") {
    const wantType = tradeType === "buy" ? "CRYPTO" : "BANK";
    const filtered = methods.filter((m) => m.type === wantType);
    const canNext = selectedMethodId != null;

    return (
      <ModalShell2 asset={asset} tradeType={tradeType} onClose={onClose}>
        <StepIndicator2 step="method" />

        <div className="p-5 space-y-3">
          {/* Summary of what user is doing */}
          <div className="rounded-xl border border-white/10 bg-[#1A1B22] px-4 py-3 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {tradeType === "buy"
                  ? t("buySellFlowModal.estimateYouPay")
                  : t("buySellFlowModal.estimateYouReceive")}
              </span>
              <span className="text-lg font-bold text-white">
                {vndEstimate || formatVND(0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>
                {tokenAmount} {asset}
              </span>
              <span>
                {t("buySellFlowModal.estimateFee")}: {feeDisplay || "0 ₫"}
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {tradeType === "buy"
              ? t("buySellFlowModal.methodSelectWallet", { asset })
              : t("buySellFlowModal.methodSelectBank")}
          </p>

          {methodsLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t("buySellFlowModal.loading")}</span>
            </div>
          )}

          {!methodsLoading && methodsError && (
            <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-center">
              <p className="text-sm text-rose-400">
                {methodsError}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMethodsLoading(true);
                  setMethodsError(null);
                  listPaymentMethods()
                    .then((all) => setMethods(all))
                    .catch((err) =>
                      setMethodsError(
                        err?.message ?? t("buySellFlowModal.error"),
                      ),
                    )
                    .finally(() => setMethodsLoading(false));
                }}
                className="mt-2 text-xs font-semibold text-rose-300 underline"
              >
                {t("buySellFlowModal.retry")}
              </button>
            </div>
          )}

          {!methodsLoading && !methodsError && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-sm text-slate-400">
                {tradeType === "buy"
                  ? t("buySellFlowModal.noWallet")
                  : t("buySellFlowModal.noBank")}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (tradeType === "buy") onGoToWallet?.();
                  else onGoToBank?.();
                }}
                className="rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 shadow-lg shadow-[#E84142]/30"
              >
                {tradeType === "buy"
                  ? t("buySellFlowModal.goToWallet")
                  : t("buySellFlowModal.goToBank")}
              </button>
            </div>
          )}

          {!methodsLoading &&
            !methodsError &&
            filtered.map((m) => {
              const bank =
                m.type === "BANK" && m.bank_id
                  ? getBankById(m.bank_id)
                  : undefined;
              const isSelected = selectedMethodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-[#E84142] bg-[#E84142]/10"
                      : "border-white/10 bg-[#1A1B22] hover:border-[#E84142]/50"
                  }`}
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                      isSelected
                        ? "bg-[#E84142]/20 text-[#FF5A5B]"
                        : "bg-[#242630] text-slate-400"
                    }`}
                  >
                    {bank?.image ? (
                      <img
                        src={bank.image}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : m.type === "BANK" ? (
                      <Banknote className="h-4 w-4" />
                    ) : (
                      <Gem className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    {m.type === "BANK" ? (
                      <>
                        <p className="text-sm font-semibold text-white truncate">
                          {bank?.short_name ?? "Bank"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {m.full_name} · {m.bank_account}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white">
                          Avalanche
                        </p>
                        <p className="text-xs font-mono text-slate-400 break-all">
                          {shortenAddress(m.wallet_address ?? "")}
                        </p>
                      </>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[#FF5A5B]" />
                  )}
                </button>
              );
            })}

          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep("confirm")}
            className="w-full rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] py-3 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 disabled:opacity-40 disabled:shadow-none"
          >
            {t("buySellFlowModal.next")}
          </button>
        </div>
      </ModalShell2>
    );
  }

  // ── Step: confirm ─────────────────────────────────────────────────────────
  if (step === "confirm") {
    const wantType = tradeType === "buy" ? "CRYPTO" : "BANK";
    const selectedMethod = methods.find(
      (m) => m.id === selectedMethodId && m.type === wantType,
    );
    const bank =
      selectedMethod?.type === "BANK" && selectedMethod.bank_id
        ? getBankById(selectedMethod.bank_id)
        : undefined;

    const handleConfirm = async () => {
      if (!selectedMethod) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        let created: Order;
        const tokenAddress =
          asset === "USDT" && usdtContract ? usdtContract : undefined;

        if (asset === "USDT" && !tokenAddress) {
          setSubmitError(
            "USDT contract address is not configured. Please set VITE_AVAX_USDT_CONTRACT in your environment.",
          );
          setSubmitting(false);
          return;
        }

        const payload = {
          amount: tokenAmount,
          chain_id: chainId,
          token_address: tokenAddress,
          asset_code: asset,
          payment_method_id: selectedMethod.id,
        };

        if (tradeType === "buy") {
          created = await createDepositOrder(payload);
        } else {
          created = await createWithdrawOrder(payload);
        }
        setOrder(created);
        setStep("payment");
      } catch (err) {
        setSubmitError((err as Error)?.message ?? t("buySellFlowModal.error"));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <ModalShell2 asset={asset} tradeType={tradeType} onClose={onClose}>
        <StepIndicator2 step="confirm" />

        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {t("buySellFlowModal.summaryTitle")}
          </p>

          <div className="rounded-2xl border border-white/10 bg-[#1A1B22] p-4 space-y-2.5">
            <SummaryRow2
              label={t("buySellFlowModal.summaryAsset")}
              value={asset}
            />
            <SummaryRow2
              label={t("buySellFlowModal.summaryType")}
              value={
                tradeType === "buy"
                  ? t("buySellFlowModal.summaryTypeBuy")
                  : t("buySellFlowModal.summaryTypeSell")
              }
            />
            <SummaryRow2
              label={t("buySellFlowModal.summaryAmount")}
              value={`${tokenAmount} ${asset}`}
              bold
            />
            {rate && (
              <>
                <SummaryRow2
                  label={t("buySellFlowModal.summaryRate")}
                  value={`${formatVND(tradeType === "buy" ? rate.buy : rate.sell)} / ${asset}`}
                />
                <SummaryRow2
                  label={t("buySellFlowModal.summaryFee")}
                  value={feeDisplay || "0 ₫"}
                />
              </>
            )}
            <SummaryRow2
              label={
                tradeType === "buy"
                  ? t("buySellFlowModal.estimateYouPay")
                  : t("buySellFlowModal.summaryNet")
              }
              value={vndEstimate || formatVND(0)}
              bold
            />
            {selectedMethod && (
              <SummaryRow2
                label={
                  tradeType === "buy"
                    ? t("buySellFlowModal.summaryWallet")
                    : t("buySellFlowModal.summaryMethod")
                }
                value={
                  selectedMethod.type === "BANK"
                    ? `${bank?.short_name ?? "Bank"} · ${selectedMethod.bank_account}`
                    : shortenAddress(selectedMethod.wallet_address ?? "")
                }
              />
            )}
          </div>

          {submitError && (
            <div className="rounded-xl border border-rose-900 bg-rose-950/30 px-4 py-3 text-sm text-rose-400">
              {submitError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("method")}
              disabled={submitting}
              className="flex-1 rounded-xl border border-white/10 bg-[#242630] py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#2C2E3B] disabled:opacity-40"
            >
              {t("buySellFlowModal.back")}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting
                ? t("buySellFlowModal.confirming")
                : t("buySellFlowModal.confirm")}
            </button>
          </div>
        </div>
      </ModalShell2>
    );
  }

  // ── Step: payment / status ────────────────────────────────────────────────
  if (step === "payment" && order) {
    const terminal = isTerminal(order.state);
    const isBuy = tradeType === "buy";

    const handleCopy = (text: string, key: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      });
    };

    const handleCancel = async () => {
      setCancelling(true);
      setCancelMsg(null);
      const result = await cancelOrder(order.id);
      setCancelling(false);
      if (result.cancelled) {
        setCancelMsg(t("buySellFlowModal.cancelSuccess"));
        setOrder((prev) =>
          prev ? { ...prev, state: OrderState.CANCELLED } : prev,
        );
        stopPolling();
      } else {
        setCancelMsg(
          result.code === "CANCEL_NOT_ALLOWED"
            ? t("buySellFlowModal.cancelFailed")
            : (result.message ?? t("buySellFlowModal.cancelFailed")),
        );
      }
    };

    const bankInfo = isBuy ? order.body?.bankInfo : null;
    const payData = !isBuy ? order.pay_data : null;
    const qrLink = isBuy
      ? order.body?.qr_link || order.body?.qr_code
      : order.pay_data?.qr_link || order.pay_data?.qr_code;

    const bank = bankInfo?.bankId ? getBankByShortName(bankInfo.bankId) : null;

    return (
      <ModalShell2 asset={asset} tradeType={tradeType} onClose={onClose}>
        <StepIndicator2 step="payment" />

        <div className="p-5 space-y-4">
          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              order.state === OrderState.COMPLETED
                ? "border-emerald-800 bg-emerald-950/30"
                : order.state === OrderState.FAILED ||
                    order.state === OrderState.CANCELLED
                  ? "border-rose-800 bg-rose-950/30"
                  : order.state === OrderState.PROCESSING
                    ? "border-[#E84142]/30 bg-[#E84142]/10"
                    : "border-amber-800 bg-amber-950/30"
            }`}
          >
            <div>
              <p className="text-xs text-slate-400">
                {t("buySellFlowModal.orderCode")}
              </p>
              <p className="text-sm font-mono font-semibold text-slate-200">
                {order.payment_code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">
                {t("buySellFlowModal.statusLabel")}
              </p>
              <p className={`text-sm font-bold ${statusColor(order.state)}`}>
                {t(statusKey(order.state))}
              </p>
            </div>
          </div>

          {polling && !terminal && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Auto-refreshing…</span>
            </div>
          )}

          {isBuy && bankInfo && (
            <div className="rounded-2xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF5A5B]">
                {t("buySellFlowModal.paymentTitleBuy")}
              </p>
              {bank && (
                <CopyRow2
                  label={t("buySellFlowModal.paymentBankName")}
                  value={`${bank.bank_name} - ${bank.short_name}`}
                  onCopy={() =>
                    handleCopy(`${bank.bank_name} - ${bank.short_name}`, "bank")
                  }
                  copied={copiedKey === "bank"}
                  t={t}
                />
              )}
              {bankInfo.bankAccountName && (
                <CopyRow2
                  label={t("buySellFlowModal.paymentAccountName")}
                  value={bankInfo.bankAccountName}
                  onCopy={() =>
                    handleCopy(bankInfo.bankAccountName!, "accName")
                  }
                  copied={copiedKey === "accName"}
                  t={t}
                />
              )}
              {bankInfo.bankAccountNumber && (
                <CopyRow2
                  label={t("buySellFlowModal.paymentAccountNumber")}
                  value={bankInfo.bankAccountNumber}
                  onCopy={() =>
                    handleCopy(bankInfo.bankAccountNumber!, "accNum")
                  }
                  copied={copiedKey === "accNum"}
                  t={t}
                />
              )}
              {bankInfo.vaAmount != null && (
                <CopyRow2
                  label={t("buySellFlowModal.paymentAmount")}
                  value={formatVND(bankInfo.vaAmount)}
                  onCopy={() => handleCopy(String(bankInfo.vaAmount!), "amt")}
                  copied={copiedKey === "amt"}
                  t={t}
                />
              )}
              {bankInfo.transferContent && (
                <CopyRow2
                  label={t("buySellFlowModal.paymentContent")}
                  value={bankInfo.transferContent}
                  onCopy={() =>
                    handleCopy(bankInfo.transferContent!, "content")
                  }
                  copied={copiedKey === "content"}
                  t={t}
                />
              )}
              {qrLink && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <img
                    src={qrLink}
                    alt="QR"
                    className="h-36 w-36 rounded-lg border border-[#E84142]/30 bg-white object-contain"
                  />
                  <p className="text-xs text-[#FF5A5B]/70">
                    {t("buySellFlowModal.paymentQrHint")}
                  </p>
                </div>
              )}
              {!terminal && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-700 bg-amber-950/30 p-3">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-amber-300">
                    {t("buySellFlowModal.paymentNote")}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isBuy && payData?.address && (
            <div className="rounded-2xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF5A5B]">
                {t("buySellFlowModal.paymentTitleSell", { asset })}
              </p>
              <CopyRow2
                label={t("buySellFlowModal.paymentAddress")}
                value={payData.address}
                mono
                onCopy={() => handleCopy(payData.address!, "addr")}
                copied={copiedKey === "addr"}
                t={t}
              />
              {(payData.qr_link || payData.qr_code) && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <img
                    src={(payData.qr_link || payData.qr_code)!}
                    alt="QR"
                    className="h-36 w-36 rounded-lg border border-[#E84142]/30 bg-white object-contain"
                  />
                </div>
              )}
              {!terminal && (
                <p className="text-xs text-[#FF5A5B]/80 pt-1">
                  {t("buySellFlowModal.paymentNoteSell", {
                    amount: tokenAmount,
                    asset,
                  })}
                </p>
              )}
            </div>
          )}

          {order.net_vnd != null && isBuy && (
            <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-4 py-3 flex justify-between items-center">
              <p className="text-xs text-emerald-400">
                {t("buySellFlowModal.summaryNet")}
              </p>
              <p className="text-sm font-bold text-emerald-400">
                {formatVND(order.net_vnd)}
              </p>
            </div>
          )}

          {cancelMsg && (
            <p className="text-xs text-slate-400">
              {cancelMsg}
            </p>
          )}

          <div className="flex gap-2">
            {!terminal && order.state === OrderState.CREATED && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-800 bg-[#242630] py-2.5 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-950/30 disabled:opacity-60"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                {cancelling
                  ? t("buySellFlowModal.cancelling")
                  : t("buySellFlowModal.cancelOrder")}
              </button>
            )}
            {terminal && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30"
              >
                {t("buySellFlowModal.done")}
              </button>
            )}
          </div>
        </div>
      </ModalShell2>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModalShell2({
  asset,
  tradeType,
  onClose,
  children,
}: {
  asset: AssetType;
  tradeType: TradeType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const isBuy = tradeType === "buy";
  const Icon = asset === "AVAX" ? Gem : Banknote;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#131418] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 bg-linear-to-r from-[#E84142] to-[#FF5A5B] p-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">
              {isBuy
                ? t("buySellFlowModal.titleBuy", { asset })
                : t("buySellFlowModal.titleSell", { asset })}
            </h2>
            <p className="text-xs text-white/80">
              {isBuy
                ? t("buySellFlowModal.subtitleBuy", { asset })
                : t("buySellFlowModal.subtitleSell", { asset })}
            </p>
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

        <div className="max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function StepIndicator2({ step }: { step: Step }) {
  const steps: Step[] = ["method", "confirm", "payment"];
  const current = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1 px-5 pt-4 pb-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div
            className={`h-1.5 w-8 rounded-full transition-colors ${
              i <= current
                ? "bg-[#E84142]"
                : "bg-white/10"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function SummaryRow2({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-400 shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-right text-white ${bold ? "font-bold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function CopyRow2({
  label,
  value,
  mono,
  onCopy,
  copied,
  t,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy: () => void;
  copied: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#FF5A5B]/70 mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-semibold text-white break-all ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        title={t("buySellFlowModal.copy")}
        className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E84142]/30 bg-[#242630] text-[#FF5A5B] transition-colors hover:bg-[#E84142]/20"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

