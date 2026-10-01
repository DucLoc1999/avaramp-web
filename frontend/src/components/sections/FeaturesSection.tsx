import {
  Zap,
  ShieldCheck,
  Percent,
  Building2,
  Lock,
  Headphones,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ICONS = [Zap, ShieldCheck, Percent, Building2, Lock, Headphones];
const ICON_STYLES = [
  "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "bg-[#E84142]/10 text-[#E84142] border-[#E84142]/20",
  "bg-blue-400/10 text-blue-400 border-blue-400/20",
  "bg-purple-400/10 text-purple-400 border-purple-400/20",
  "bg-rose-400/10 text-rose-400 border-rose-400/20",
];

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = t("features.items", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#0B0C0E] py-24"
    >
      <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#E84142]/5 blur-[140px]" />
      <div className="section-container relative">
        <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#E84142]">
            {t("features.eyebrow")}
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#14151B] p-6 transition-all duration-200 hover:border-[#E84142]/30 hover:bg-[#181922]"
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border ${ICON_STYLES[i]}`}
                >
                  <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#E84142] transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
