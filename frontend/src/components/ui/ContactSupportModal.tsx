import { Phone, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ open, onClose }: ContactSupportModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

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
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#131418] p-6 shadow-2xl text-center overflow-hidden flex flex-col items-center">
        <div className="mx-auto mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E84142]/20">
          <Phone className="h-8 w-8 text-[#FF5A5B]" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-white uppercase tracking-wide">
          {t("supportModal.title")}
        </h2>

        <p className="mb-4 text-sm text-slate-400">
          {t("supportModal.description")}
        </p>

        <div className="mb-6 flex flex-col items-center gap-2">
          <p className="text-sm text-slate-400 mt-2">
            {t("supportModal.footer")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all hover:brightness-110 shadow-lg shadow-[#E84142]/30 focus:outline-none focus:ring-2 focus:ring-[#E84142] focus:ring-offset-2 focus:ring-offset-[#131418]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("supportModal.backButton")}</span>
        </button>
      </div>
    </div>
  );
}