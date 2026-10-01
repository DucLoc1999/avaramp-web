import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";

  const handleToggle = () => {
    const next = isVi ? "en" : "vi";
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
      title={isVi ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Globe className="h-3.5 w-3.5 text-slate-400" />
      <span>{isVi ? "VI 🇻🇳" : "EN 🇺🇸"}</span>
    </button>
  );
};
