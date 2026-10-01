import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  QrCode,
  Wallet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Coins,
  Building2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BuySellModal } from "../ui/BuySellModal";

const BUY_ICONS: LucideIcon[] = [Coins, Wallet, QrCode, Zap];
const SELL_ICONS: LucideIcon[] = [Coins, Building2, ArrowRight, CheckCircle2];

export const HowItWorksSection = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  const steps = t(activeTab === "buy" ? "howItWorks.buySteps" : "howItWorks.sellSteps", {
    returnObjects: true,
  }) as { title: string; description: string }[];
  const icons = activeTab === "buy" ? BUY_ICONS : SELL_ICONS;

  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-white/5 bg-[#0E0F14] py-24"
    >
      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("howItWorks.eyebrow")}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("howItWorks.title")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("howItWorks.subtitle")}
          </p>

          {/* Toggle */}
          <div className="mt-4 inline-flex rounded-xl border border-white/10 bg-[#1A1B22] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("buy")}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                activeTab === "buy"
                  ? "bg-[#E84142] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("howItWorks.buyTab")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sell")}
              className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                activeTab === "sell"
                  ? "bg-[#E84142] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("howItWorks.sellTab")}
            </button>
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={`${activeTab}-${idx}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#14151B] p-6 transition-all hover:border-[#E84142]/40 hover:bg-[#181A22]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-mono text-3xl font-black text-white/20 transition-colors group-hover:text-[#E84142]/50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E84142]/20 bg-[#E84142]/10 text-[#E84142]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-base font-bold text-white transition-colors group-hover:text-[#E84142]">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 border-t border-white/5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#E84142]" />
                  <span>{t("howItWorks.automated")}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#E84142] to-[#FF5A5B] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#E84142]/25 transition-all hover:brightness-110"
          >
            <span>{t("howItWorks.cta")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <BuySellModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
