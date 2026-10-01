import { useTranslation } from "react-i18next";
import { Send, Github, Twitter, ExternalLink } from "lucide-react";

const BOT_URL = import.meta.env.VITE_TELEGRAM_LINK || "";

export const SiteFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#0A0B0E] text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2.5 select-none">
              <img
                src="/logo.png"
                alt="AvaRamp"
                className="h-9 w-9 rounded-lg border border-white/10"
              />
              <div className="flex items-center text-xl font-extrabold tracking-tight">
                <span className="text-[#E84142]">Ava</span>
                <span className="text-white">Ramp</span>
                <span className="ml-1.5 rounded border border-[#E84142]/30 bg-[#E84142]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#E84142]">
                  AVAX
                </span>
              </div>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              {t("footer.tagline")}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#E84142]/20 bg-[#E84142]/10 px-2.5 py-1 text-[11px] font-bold text-[#E84142]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E84142]" />
                {t("footer.badgeChain")}
              </span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                {t("footer.badgeNapas")}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={BOT_URL}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="X / Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                title="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {t("footer.colProducts")}
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="#hero" className="transition-colors hover:text-white">
                  {t("footer.linkOnRamp")}
                </a>
              </li>
              <li>
                <a href="#hero" className="transition-colors hover:text-white">
                  {t("footer.linkOffRamp")}
                </a>
              </li>
              <li>
                <a href="#rates" className="transition-colors hover:text-white">
                  {t("footer.linkLiveRates")}
                </a>
              </li>
              <li>
                <a
                  href={BOT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {t("footer.linkTelegramBot")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {t("footer.colResources")}
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="#features" className="transition-colors hover:text-white">
                  {t("footer.linkWhyAvaRamp")}
                </a>
              </li>
              <li>
                <a href="#process" className="transition-colors hover:text-white">
                  {t("footer.linkProcess")}
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-white">
                  {t("footer.linkFaq")}
                </a>
              </li>
              <li>
                <a
                  href="https://snowtrace.io"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 transition-colors hover:text-white"
                >
                  {t("footer.linkExplorer")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              {t("footer.colLegal")}
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="/terms" className="transition-colors hover:text-white">
                  {t("footer.termsOfService")}
                </a>
              </li>
              <li>
                <a href="/privacy" className="transition-colors hover:text-white">
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a href="#features" className="transition-colors hover:text-white">
                  {t("footer.linkNonCustodial")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 space-y-4 border-t border-white/10 pt-8">
          <p className="max-w-5xl text-[11px] leading-relaxed text-slate-400">
            {t("footer.disclaimer")}
          </p>
          <div className="flex flex-col items-center justify-between gap-4 text-[11px] text-slate-400 sm:flex-row">
            <div>{t("footer.copyright")}</div>
            <div className="flex items-center gap-4">
              <span>{t("footer.trustAudited")}</span>
              <span>•</span>
              <span>{t("footer.trustNonCustodial")}</span>
              <span>•</span>
              <span>{t("footer.trustSettlement")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
