import { useTranslation } from "react-i18next";

interface RampFooterProps {
  onContactSupport?: () => void;
}

export const RampFooter = ({ onContactSupport }: RampFooterProps) => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-6 dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 text-center">
        <a href="/" className="flex items-center gap-2 mb-1">
          <img
            src="/exchanges/avaRamp.png"
            alt="AvaRamp"
            className="h-6 w-6 rounded-md border border-slate-200 dark:border-slate-600"
          />
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ava<span className="text-blue-600">Ramp</span>
          </span>
        </a>
        <div className="flex gap-4">
          <a
            href="/terms"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400"
          >
            {t("footer.termsOfService")}
          </a>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <a
            href="/privacy"
            className="text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400"
          >
            {t("footer.privacyPolicy")}
          </a>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={onContactSupport}
            className="text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400"
          >
            {t("footer.contactSupport") || "Contact Support"}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
};
