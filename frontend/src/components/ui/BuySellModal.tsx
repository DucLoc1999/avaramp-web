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
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#131417] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-6 pt-8">
          <h2 className="text-xl font-bold text-white">
            {t("modal.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("modal.description")}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-[#E84142]/40 hover:bg-[#E84142]/10"
            >
              <span className="text-2xl" aria-hidden="true">
                ✈
              </span>
              <div>
                <p className="font-semibold text-slate-100 transition-colors group-hover:text-[#FF5A5B]">
                  {t("modal.telegramLabel")}
                </p>
                <p className="text-xs text-slate-400 transition-colors group-hover:text-[#E84142]">
                  {t("modal.telegramSub")}
                </p>
              </div>
            </a>

            <a
              href="/ramp"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors hover:border-[#E84142]/40 hover:bg-[#E84142]/10"
            >
              <span className="text-2xl" aria-hidden="true">
                🌐
              </span>
              <div>
                <p className="font-semibold text-slate-100 transition-colors group-hover:text-[#FF5A5B]">
                  {t("modal.websiteLabel")}
                </p>
                <p className="text-xs text-slate-400 transition-colors group-hover:text-[#E84142]">
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
