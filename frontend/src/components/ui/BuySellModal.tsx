import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const BOT_URL =
  import.meta.env.VITE_TELEGRAM_LINK || "";

interface BuySellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuySellModal = ({ isOpen, onClose }: BuySellModalProps) => {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-6 pt-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("modal.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("modal.description")}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-blue-950"
            >
              <span className="text-2xl" aria-hidden="true">
                ✈
              </span>
              <div>
                <p className="font-semibold text-slate-800 transition-colors group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300">
                  {t("modal.telegramLabel")}
                </p>
                <p className="text-xs text-slate-500 transition-colors group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400">
                  {t("modal.telegramSub")}
                </p>
              </div>
            </a>

            <a
              href="/ramp"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 transition-colors hover:bg-blue-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-blue-950"
            >
              <span className="text-2xl" aria-hidden="true">
                🌐
              </span>
              <div>
                <p className="font-semibold text-slate-800 transition-colors group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300">
                  {t("modal.websiteLabel")}
                </p>
                <p className="text-xs text-slate-500 transition-colors group-hover:text-blue-500 dark:text-slate-400 dark:group-hover:text-blue-400">
                  {t("modal.websiteSub")}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
