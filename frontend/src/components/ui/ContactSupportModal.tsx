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
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 text-center overflow-hidden flex flex-col items-center">
        <div className="mx-auto mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Phone className="h-8 w-8 text-blue-500" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
          {t("supportModal.title")}
        </h2>

        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t("supportModal.description")}
        </p>

        <div className="mb-6 flex flex-col items-center gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t("supportModal.footer")}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("supportModal.backButton")}</span>
        </button>
      </div>
    </div>
  );
}