import { X, UserRound, BadgeCheck, Landmark, Gem, Gift, Plus, Pencil, Trash2, Search, Check, Upload, CheckCircle2, ShieldCheck, Loader2, Wallet } from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PaymentMethod } from "@shared/api";
import { banks, getBankById } from "../../config/banks";
import {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  isValidEvmAddress,
} from "../../utils/paymentMethods";
import { getSession, handleUnauthorized } from "../../utils/session";

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

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  data: MeData | null;
  loading: boolean;
  onKycSuccess?: () => void;
  onPaymentMethodsChanged?: () => void;
  initialTab?: Tab;
}

export type Tab = "account" | "kyc" | "bank" | "wallet" | "referral";

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-white break-all">
        {value || <span className="text-slate-600">—</span>}
      </span>
    </div>
  );
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

interface KycExtractedData {
  id_number?: string | null;
  name?: string | null;
  dob?: string | null;
  sex?: string | null;
  nationality?: string | null;
  home?: string | null;
  address?: string | null;
  doe?: string | null;
}

interface BankForm {
  bankId: number | null;
  fullName: string;
  bankAccount: string;
}

const EMPTY_BANK_FORM: BankForm = { bankId: null, fullName: "", bankAccount: "" };

export function SettingsModal({
  open,
  onClose,
  data,
  loading,
  onKycSuccess,
  onPaymentMethodsChanged,
  initialTab = "account",
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  // KYC state
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycResult, setKycResult] = useState<KycExtractedData | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Bank state
  const [bankAccounts, setBankAccounts] = useState<PaymentMethod[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankEditing, setBankEditing] = useState<PaymentMethod | null>(null);
  const [bankIsAdding, setBankIsAdding] = useState(false);
  const [bankForm, setBankForm] = useState<BankForm>(EMPTY_BANK_FORM);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankFormError, setBankFormError] = useState<string | null>(null);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const bankPickerRef = useRef<HTMLDivElement>(null);
  const [bankPickerRect, setBankPickerRect] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [bankDeletingId, setBankDeletingId] = useState<number | null>(null);
  const [bankConfirmId, setBankConfirmId] = useState<number | null>(null);

  // Wallet state
  const [wallets, setWallets] = useState<PaymentMethod[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletEditing, setWalletEditing] = useState<PaymentMethod | null>(null);
  const [walletIsAdding, setWalletIsAdding] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletFormError, setWalletFormError] = useState<string | null>(null);
  const [walletDeletingId, setWalletDeletingId] = useState<number | null>(null);
  const [walletConfirmId, setWalletConfirmId] = useState<number | null>(null);

  const tabs = [
    { id: "account" as Tab, label: "Account", icon: UserRound },
    { id: "kyc" as Tab, label: "KYC", icon: BadgeCheck },
    { id: "bank" as Tab, label: "Bank", icon: Landmark },
    { id: "wallet" as Tab, label: "Wallet", icon: Gem },
    { id: "referral" as Tab, label: "Referral", icon: Gift },
  ];

  const loadBankAccounts = () => {
    setBankLoading(true);
    setBankError(null);
    listPaymentMethods()
      .then((methods) => {
        setBankAccounts(methods.filter((m) => m.type === "BANK"));
      })
      .catch((err) => setBankError(err?.message ?? t("bankAccountModal.error")))
      .finally(() => setBankLoading(false));
  };

  const loadWallets = () => {
    setWalletLoading(true);
    setWalletError(null);
    listPaymentMethods()
      .then((methods) => {
        setWallets(methods.filter((m) => m.type === "CRYPTO"));
      })
      .catch((err) => setWalletError(err?.message ?? t("cryptoWalletModal.error")))
      .finally(() => setWalletLoading(false));
  };

  // Load bank accounts when bank tab is active
  useEffect(() => {
    if (activeTab !== "bank" || !open) return;
    loadBankAccounts();
    setBankIsAdding(false);
    setBankEditing(null);
    setBankConfirmId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, open]);

  // Load wallets when wallet tab is active
  useEffect(() => {
    if (activeTab !== "wallet" || !open) return;
    loadWallets();
    setWalletIsAdding(false);
    setWalletEditing(null);
    setWalletConfirmId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, open]);

  // Bank picker positioning
  useLayoutEffect(() => {
    if (!bankPickerOpen) {
      setBankPickerRect(null);
      return;
    }
    const measure = () => {
      const el = bankPickerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBankPickerRect({ left: r.left, top: r.bottom + 4, width: r.width });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [bankPickerOpen]);

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter(
      (b) =>
        b.short_name.toLowerCase().includes(q) ||
        b.bank_name.toLowerCase().includes(q),
    );
  }, [bankQuery]);

  if (!open) return null;

  const handleKycFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setKycError(t("kycModal.errorNotImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setKycError(t("kycModal.errorSize"));
      return;
    }

    setKycError(null);
    const previewUrl = URL.createObjectURL(file);

    if (type === "front") {
      setFrontImage(file);
      setFrontPreview(previewUrl);
    } else {
      setBackImage(file);
      setBackPreview(previewUrl);
    }
  };

  const handleKycSubmit = async () => {
    if (!frontImage || !backImage) {
      setKycError(t("kycModal.errorMissingImages"));
      return;
    }

    setKycLoading(true);
    setKycError(null);

    try {
      const session = getSession();
      if (!session?.token) {
        handleUnauthorized();
        return;
      }

      const formData = new FormData();
      formData.append("image_front", frontImage);
      formData.append("image_back", backImage);

      const baseUrl = import.meta.env.VITE_BASE_URL as string;
      const res = await fetch(`${baseUrl}/api/me/kyc`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const body = await res.json();

      if (body.success) {
        setKycResult((body.data ?? {}) as KycExtractedData);
        onKycSuccess?.();
      } else {
        setKycError(body.error?.message || t("kycModal.errorSubmit"));
      }
    } catch (err) {
      console.error("[/api/me/kyc] error:", err);
      setKycError(t("kycModal.errorSubmit"));
    } finally {
      setKycLoading(false);
    }
  };

  const handleBankSave = async () => {
    if (!bankForm.bankId || !bankForm.fullName.trim() || !bankForm.bankAccount.trim()) {
      setBankFormError(t("bankAccountModal.required"));
      return;
    }
    setBankSaving(true);
    setBankFormError(null);
    try {
      if (bankEditing) {
        await updatePaymentMethod(bankEditing.id, {
          bank_id: bankForm.bankId,
          full_name: bankForm.fullName.trim(),
          bank_account: bankForm.bankAccount.trim(),
        });
      } else {
        await createPaymentMethod({
          type: "BANK",
          bank_id: bankForm.bankId,
          full_name: bankForm.fullName.trim(),
          bank_account: bankForm.bankAccount.trim(),
        });
      }
      setBankIsAdding(false);
      setBankEditing(null);
      loadBankAccounts();
      onPaymentMethodsChanged?.();
    } catch (err) {
      setBankFormError((err as Error)?.message ?? t("bankAccountModal.error"));
    } finally {
      setBankSaving(false);
    }
  };

  const handleBankDelete = async (id: number) => {
    setBankDeletingId(id);
    try {
      await deletePaymentMethod(id);
      setBankConfirmId(null);
      loadBankAccounts();
      onPaymentMethodsChanged?.();
    } catch (err) {
      setBankError((err as Error)?.message ?? t("bankAccountModal.error"));
    } finally {
      setBankDeletingId(null);
    }
  };

  const handleWalletSave = async () => {
    const trimmed = walletAddress.trim();
    if (!trimmed) {
      setWalletFormError(t("cryptoWalletModal.required"));
      return;
    }
    if (!isValidEvmAddress(trimmed)) {
      setWalletFormError(t("cryptoWalletModal.addressInvalid"));
      return;
    }
    setWalletSaving(true);
    setWalletFormError(null);
    try {
      if (walletEditing) {
        await updatePaymentMethod(walletEditing.id, { wallet_address: trimmed });
      } else {
        await createPaymentMethod({ type: "CRYPTO", wallet_address: trimmed });
      }
      setWalletIsAdding(false);
      setWalletEditing(null);
      loadWallets();
      onPaymentMethodsChanged?.();
    } catch (err) {
      setWalletFormError((err as Error)?.message ?? t("cryptoWalletModal.error"));
    } finally {
      setWalletSaving(false);
    }
  };

  const handleWalletDelete = async (id: number) => {
    setWalletDeletingId(id);
    try {
      await deletePaymentMethod(id);
      setWalletConfirmId(null);
      loadWallets();
      onPaymentMethodsChanged?.();
    } catch (err) {
      setWalletError((err as Error)?.message ?? t("cryptoWalletModal.error"));
    } finally {
      setWalletDeletingId(null);
    }
  };

  const renderContent = () => {
    if (activeTab === "account") {
      return (
        <div className="space-y-5">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#E84142]" />
              <span className="text-sm">Loading profile…</span>
            </div>
          )}

          {!loading && !data && (
            <p className="py-10 text-center text-sm text-slate-400">
              Could not load account info.
            </p>
          )}

          {!loading && data && (
            <>
              <div className="rounded-2xl border border-white/10 bg-[#1A1B22] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Personal
                </p>
                <Row label="Full name" value={data.name} />
                <Row label="Date of Birth" value={formatDate(data.dob)} />
                <Row label="Gender" value={data.sex} />
                <Row label="Nationality" value={data.nationality} />
                <Row label="ID number" value={data.id_number} />
                <Row label="ID expiry" value={formatDate(data.doe)} />
                <Row label="Home" value={data.home} />
                <Row label="Address" value={data.address} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1A1B22] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Contact
                </p>
                <Row label="Email" value={data.email} />
                <Row label="Phone Number" value={data.phone} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1A1B22] p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Account
                </p>
                <Row label="User ID" value={String(data.id)} />
                <Row label="Member since" value={formatDate(data.created_at)} />
              </div>
            </>
          )}
        </div>
      );
    }

    if (activeTab === "kyc") {
      const isApproved = data?.kyc_status === "approved";

      return (
        <div className="space-y-5">
          {kycResult ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {t("kycModal.resultTitle")}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {t("kycModal.resultDesc")}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1A1B22] p-4 space-y-3">
                <Row label={t("kycModal.fieldName")} value={kycResult.name} />
                <Row label={t("kycModal.fieldIdNumber")} value={kycResult.id_number} />
                <Row label={t("kycModal.fieldDob")} value={formatDate(kycResult.dob)} />
                <Row label={t("kycModal.fieldSex")} value={kycResult.sex} />
                <Row label={t("kycModal.fieldNationality")} value={kycResult.nationality} />
                <Row label={t("kycModal.fieldDoe")} value={formatDate(kycResult.doe)} />
                <Row label={t("kycModal.fieldHome")} value={kycResult.home} />
                <Row label={t("kycModal.fieldAddress")} value={kycResult.address} />
              </div>
            </div>
          ) : isApproved ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t("kycModal.verifiedTitle")}
              </h3>
              <p className="text-slate-400">
                {t("kycModal.verifiedDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-slate-300">
                {t("kycModal.instruction")}
              </p>

              {kycError && (
                <div className="rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400">
                  {kycError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t("kycModal.frontImage")}
                  </label>
                  <div
                    onClick={() => !kycLoading && frontInputRef.current?.click()}
                    className={`relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                      frontPreview
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/15 bg-[#1A1B22] hover:border-[#E84142]/50 hover:bg-[#E84142]/5"
                    }`}
                  >
                    {frontPreview ? (
                      <>
                        <img src={frontPreview} alt="Front ID" className="h-full w-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6 text-slate-400" />
                        <span className="text-sm font-medium text-slate-400">
                          {t("kycModal.clickToUpload")}
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={frontInputRef}
                    onChange={(e) => handleKycFileChange(e, "front")}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t("kycModal.backImage")}
                  </label>
                  <div
                    onClick={() => !kycLoading && backInputRef.current?.click()}
                    className={`relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                      backPreview
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-white/15 bg-[#1A1B22] hover:border-[#E84142]/50 hover:bg-[#E84142]/5"
                    }`}
                  >
                    {backPreview ? (
                      <>
                        <img src={backPreview} alt="Back ID" className="h-full w-full object-cover opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6 text-slate-400" />
                        <span className="text-sm font-medium text-slate-400">
                          {t("kycModal.clickToUpload")}
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={backInputRef}
                    onChange={(e) => handleKycFileChange(e, "back")}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleKycSubmit}
                disabled={kycLoading || !frontImage || !backImage}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 disabled:opacity-50 disabled:shadow-none"
              >
                {kycLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("kycModal.submitting")}
                  </>
                ) : (
                  t("kycModal.submit")
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "bank") {
      const selectedBank = bankForm.bankId ? getBankById(bankForm.bankId) : undefined;

      return (
        <div className="space-y-3">
          {bankLoading && (
            <p className="py-8 text-center text-sm text-slate-500">
              {t("bankAccountModal.loading")}
            </p>
          )}

          {!bankLoading && bankError && (
            <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-center">
              <p className="text-sm text-rose-400">{bankError}</p>
              <button
                type="button"
                onClick={loadBankAccounts}
                className="mt-2 text-xs font-semibold text-rose-300 underline"
              >
                {t("bankAccountModal.retry")}
              </button>
            </div>
          )}

          {!bankLoading && !bankError && bankAccounts.length === 0 && !bankIsAdding && (
            <p className="py-8 text-center text-sm text-slate-500">
              {t("bankAccountModal.empty")}
            </p>
          )}

          {!bankLoading &&
            !bankError &&
            bankAccounts.map((acct) => {
              const bank = acct.bank_id ? getBankById(acct.bank_id) : undefined;
              return (
                <div
                  key={acct.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#1A1B22] p-4"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E84142]/20 text-[#FF5A5B]">
                    {bank?.image ? (
                      <img src={bank.image} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <Landmark className="h-4 w-4" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {bank?.short_name ?? t("bankAccountModal.unknownBank")}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {acct.full_name}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      {acct.bank_account}
                    </p>
                  </div>

                  {bankConfirmId === acct.id ? (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleBankDelete(acct.id)}
                        disabled={bankDeletingId === acct.id}
                        className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                      >
                        {bankDeletingId === acct.id
                          ? t("bankAccountModal.deleting")
                          : t("bankAccountModal.deleteConfirmYes")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankConfirmId(null)}
                        className="rounded-lg border border-white/10 bg-[#242630] px-2 py-1 text-xs font-semibold text-slate-300"
                      >
                        {t("bankAccountModal.deleteConfirmNo")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setBankForm({
                            bankId: acct.bank_id,
                            fullName: acct.full_name ?? "",
                            bankAccount: acct.bank_account ?? "",
                          });
                          setBankEditing(acct);
                          setBankFormError(null);
                          setBankIsAdding(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#242630] text-slate-400 transition-colors hover:bg-[#E84142]/20 hover:text-[#FF5A5B]"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBankConfirmId(acct.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#242630] text-slate-400 transition-colors hover:bg-rose-950/30 hover:text-rose-400"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          {bankIsAdding && (
            <div className="rounded-2xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF5A5B]">
                {bankEditing ? t("bankAccountModal.editTitle") : t("bankAccountModal.newTitle")}
              </p>

              <div className="relative" ref={bankPickerRef}>
                <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#1A1B22] px-3 py-2 text-sm text-white focus-within:border-[#E84142] focus-within:ring-2 focus-within:ring-[#E84142]/20">
                  {selectedBank?.image && !bankPickerOpen && (
                    <img src={selectedBank.image} alt="" className="h-5 w-5 shrink-0 object-contain" />
                  )}
                  {(bankPickerOpen || !selectedBank) && (
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <input
                    type="text"
                    value={bankPickerOpen ? bankQuery : selectedBank?.short_name ?? ""}
                    onFocus={() => {
                      setBankPickerOpen(true);
                      setBankQuery("");
                    }}
                    onChange={(e) => {
                      setBankPickerOpen(true);
                      setBankQuery(e.target.value);
                    }}
                    onBlur={() => window.setTimeout(() => setBankPickerOpen(false), 150)}
                    placeholder={t("bankAccountModal.selectBank")}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  />
                </div>

                {bankPickerOpen && bankPickerRect && (
                  <div
                    className="fixed z-60 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-[#1C1D24] shadow-2xl"
                    style={{
                      left: bankPickerRect.left,
                      top: bankPickerRect.top,
                      width: bankPickerRect.width,
                    }}
                  >
                    {filteredBanks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setBankForm((f) => ({ ...f, bankId: b.id }));
                          setBankPickerOpen(false);
                          setBankQuery("");
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-[#E84142]/20"
                      >
                        <img src={b.image} alt="" className="h-5 w-5 shrink-0 object-contain" />
                        <span className="flex-1 truncate">{b.short_name}</span>
                        {bankForm.bankId === b.id && <Check className="h-4 w-4 text-[#FF5A5B]" />}
                      </button>
                    ))}
                    {filteredBanks.length === 0 && (
                      <p className="px-3 py-4 text-center text-xs text-slate-400">
                        {t("bankAccountModal.noBankMatch")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder={t("bankAccountModal.accountHolder")}
                value={bankForm.fullName}
                onChange={(e) => setBankForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#1A1B22] px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-[#E84142] focus:ring-2 focus:ring-[#E84142]/20"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("bankAccountModal.accountNumber")}
                value={bankForm.bankAccount}
                onChange={(e) => setBankForm((f) => ({ ...f, bankAccount: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#1A1B22] px-3 py-2 text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-[#E84142] focus:ring-2 focus:ring-[#E84142]/20"
              />

              {bankFormError && (
                <p className="text-xs text-rose-400">{bankFormError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBankSave}
                  disabled={bankSaving}
                  className="flex-1 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 focus:outline-none focus:ring-2 focus:ring-[#E84142] focus:ring-offset-2 focus:ring-offset-[#131418] disabled:opacity-60"
                >
                  {bankSaving ? t("bankAccountModal.saving") : t("bankAccountModal.save")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBankIsAdding(false);
                    setBankEditing(null);
                    setBankFormError(null);
                    setBankPickerOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-[#242630] px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#2C2E3B]"
                >
                  {t("bankAccountModal.cancel")}
                </button>
              </div>
            </div>
          )}

          {!bankLoading && !bankError && !bankIsAdding && (
            <button
              type="button"
              onClick={() => {
                setBankForm(EMPTY_BANK_FORM);
                setBankEditing(null);
                setBankFormError(null);
                setBankIsAdding(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-[#E84142]/50 hover:text-[#FF5A5B]"
            >
              <Plus className="h-4 w-4" />
              {t("bankAccountModal.addButton")}
            </button>
          )}
        </div>
      );
    }

    if (activeTab === "wallet") {
      return (
        <div className="space-y-3">
          {walletLoading && (
            <p className="py-8 text-center text-sm text-slate-500">
              {t("cryptoWalletModal.loading")}
            </p>
          )}

          {!walletLoading && walletError && (
            <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-center">
              <p className="text-sm text-rose-400">{walletError}</p>
              <button
                type="button"
                onClick={loadWallets}
                className="mt-2 text-xs font-semibold text-rose-300 underline"
              >
                {t("cryptoWalletModal.retry")}
              </button>
            </div>
          )}

          {!walletLoading && !walletError && wallets.length === 0 && !walletIsAdding && (
            <p className="py-8 text-center text-sm text-slate-500">
              {t("cryptoWalletModal.empty")}
            </p>
          )}

          {!walletLoading &&
            !walletError &&
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#1A1B22] p-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E84142]/20 text-[#FF5A5B]">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-full bg-[#E84142]/20 px-2 py-0.5 text-xs font-medium text-[#FF5A5B]">
                      Avalanche
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-mono text-slate-400 break-all">
                    {shortenAddress(wallet.wallet_address ?? "")}
                  </p>
                </div>

                {walletConfirmId === wallet.id ? (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleWalletDelete(wallet.id)}
                      disabled={walletDeletingId === wallet.id}
                      className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                    >
                      {walletDeletingId === wallet.id
                        ? t("cryptoWalletModal.deleting")
                        : t("cryptoWalletModal.deleteConfirmYes")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletConfirmId(null)}
                      className="rounded-lg border border-white/10 bg-[#242630] px-2 py-1 text-xs font-semibold text-slate-300"
                    >
                      {t("cryptoWalletModal.deleteConfirmNo")}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setWalletAddress(wallet.wallet_address ?? "");
                        setWalletEditing(wallet);
                        setWalletFormError(null);
                        setWalletIsAdding(true);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#242630] text-slate-400 transition-colors hover:bg-[#E84142]/20 hover:text-[#FF5A5B]"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setWalletConfirmId(wallet.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#242630] text-slate-400 transition-colors hover:bg-rose-950/30 hover:text-rose-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

          {walletIsAdding && (
            <div className="rounded-2xl border border-[#E84142]/30 bg-[#E84142]/10 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF5A5B]">
                {walletEditing ? t("cryptoWalletModal.editTitle") : t("cryptoWalletModal.newTitle")}
              </p>
              <input
                type="text"
                placeholder={t("cryptoWalletModal.address")}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#1A1B22] px-3 py-2 text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-[#E84142] focus:ring-2 focus:ring-[#E84142]/20"
              />

              {walletFormError && (
                <p className="text-xs text-rose-400">{walletFormError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleWalletSave}
                  disabled={walletSaving}
                  className="flex-1 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 focus:outline-none focus:ring-2 focus:ring-[#E84142] focus:ring-offset-2 focus:ring-offset-[#131418] disabled:opacity-60"
                >
                  {walletSaving ? t("cryptoWalletModal.saving") : t("cryptoWalletModal.save")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWalletIsAdding(false);
                    setWalletEditing(null);
                    setWalletFormError(null);
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-[#242630] px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-[#2C2E3B]"
                >
                  {t("cryptoWalletModal.cancel")}
                </button>
              </div>
            </div>
          )}

          {!walletLoading && !walletError && !walletIsAdding && (
            <button
              type="button"
              onClick={() => {
                setWalletAddress("");
                setWalletEditing(null);
                setWalletFormError(null);
                setWalletIsAdding(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 py-3 text-sm font-semibold text-slate-400 transition-colors hover:border-[#E84142]/50 hover:text-[#FF5A5B]"
            >
              <Plus className="h-4 w-4" />
              {t("cryptoWalletModal.addButton")}
            </button>
          )}
        </div>
      );
    }

    if (activeTab === "referral") {
      return (
        <div className="py-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E84142]/20">
            <Gift className="h-8 w-8 text-[#FF5A5B]" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">
            Referral Program
          </h3>
          <p className="text-sm text-slate-400">
            {t("workInProgressModal.description")}
          </p>
        </div>
      );
    }

    return null;
  };

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

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#131418] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/10 bg-linear-to-r from-[#E84142] to-[#FF5A5B] p-5">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <p className="text-xs text-white/80">Manage your account</p>
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

        <div className="border-b border-white/10">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-[#E84142] text-[#FF5A5B]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
