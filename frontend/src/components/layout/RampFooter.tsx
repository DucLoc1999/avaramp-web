import { useTranslation } from "react-i18next";

interface RampFooterProps {
  onContactSupport?: () => void;
}

export const RampFooter = ({ onContactSupport }: RampFooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#0B0C0E] py-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 text-center">
        <a href="/" className="flex items-center gap-2 mb-1">
          <img
            src="/logo.png"
            alt="AvaRamp"
            className="h-6 w-6 rounded-md border border-white/10"
          />
          <span className="text-sm font-bold tracking-tight text-white">
            Ava<span className="text-[#E84142]">Ramp</span>
          </span>
        </a>
        <div className="flex gap-4">
          <a
            href="/terms"
            className="text-xs font-medium text-slate-400 transition-colors hover:text-[#E84142]"
          >
            {t("footer.termsOfService")}
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="/privacy"
            className="text-xs font-medium text-slate-400 transition-colors hover:text-[#E84142]"
          >
            {t("footer.privacyPolicy")}
          </a>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={onContactSupport}
            className="text-xs font-medium text-slate-400 transition-colors hover:text-[#E84142]"
          >
            {t("footer.contactSupport") || "Contact Support"}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
};
