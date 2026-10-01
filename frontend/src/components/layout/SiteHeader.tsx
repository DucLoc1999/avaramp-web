import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { BuySellModal } from "../ui/BuySellModal";

export const SiteHeader = () => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const NAV_LINKS = [
    { label: t("nav.whyAvaRamp"), href: "#features" },
    { label: t("nav.process"), href: "#process" },
    { label: t("nav.liveRates"), href: "#rates" },
    { label: t("nav.supported"), href: "#supported" },
    { label: t("nav.developers"), href: "#developers" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  const handleToggleMenu = () => setIsMenuOpen((open) => !open);
  const handleCloseMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0E0F12]/90 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 border-b border-[#E84142]/20 bg-gradient-to-r from-[#E84142]/20 via-[#E84142]/10 to-transparent px-4 py-1.5 text-center text-xs">
          <span className="inline-flex items-center rounded bg-[#E84142] px-1.5 py-0.5 text-[10px] font-bold text-white">
            LIVE
          </span>
          <span className="font-medium text-slate-300">
            {t("header.banner")}
          </span>
        </div>

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5 select-none">
            <img
              src="/logo.png"
              alt="AvaRamp"
              className="h-10 w-10 rounded-lg border border-white/10"
            />
            <div className="flex flex-col justify-center leading-none">
              <div className="flex items-center text-xl font-extrabold tracking-tight">
                <span className="text-[#E84142]">Ava</span>
                <span className="text-white">Ramp</span>
                <span className="ml-1.5 rounded border border-[#E84142]/30 bg-[#E84142]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#E84142]">
                  AVAX
                </span>
              </div>
              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                On &amp; Off Ramp Platform
              </span>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-slate-300 transition-colors hover:text-[#E84142]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#E84142] to-[#FF5A5B] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E84142]/20 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t("nav.buySell")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 lg:hidden"
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 bg-[#0E0F12] lg:hidden">
            <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-medium text-slate-200">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleCloseMenu}
                  className="rounded-xl px-3 py-2 transition-colors hover:bg-white/5 hover:text-[#E84142]"
                >
                  {link.label}
                </a>
              ))}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <LanguageSwitcher />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDark((d) => !d);
                      handleCloseMenu();
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
                    aria-label={isDark ? t("nav.lightMode") : t("nav.darkMode")}
                  >
                    {isDark ? (
                      <Sun className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(true);
                      handleCloseMenu();
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#E84142] to-[#FF5A5B] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110"
                  >
                    {t("nav.buySell")}
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      <BuySellModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
