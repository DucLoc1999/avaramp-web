import { Menu, Moon, Sun, Settings, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";

interface RampHeaderProps {
  onLogout?: () => void;
  onSettings?: () => void;
}

export const RampHeader = ({ onLogout, onSettings }: RampHeaderProps) => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0C0E]/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-4 px-4">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="AvaRamp"
            className="h-8 w-8 rounded-lg border border-white/10"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Ava<span className="text-[#E84142]">Ramp</span>
          </span>
        </a>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:text-[#E84142]"
            aria-label={isDark ? t("ramp.lightMode") : t("ramp.darkMode")}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:text-[#E84142]"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#1C1D24] shadow-2xl">
                {onSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSettings();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
                  >
                    <Settings className="h-4 w-4" />
                    {t("ramp.settings") || "Settings"}
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#FF5A5B] transition-colors hover:bg-[#E84142]/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("ramp.logout")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
