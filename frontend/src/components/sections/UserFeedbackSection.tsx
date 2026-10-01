import { Star, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
];

export const UserFeedbackSection = () => {
  const { t } = useTranslation();

  const items = t("feedback.items", { returnObjects: true }) as {
    quote: string;
    name: string;
    role: string;
    badge: string;
    volume: string;
  }[];

  return (
    <section className="relative border-t border-white/5 bg-[#0B0C0E] py-24">
      <div className="section-container relative">
        {/* Header */}
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
            <Sparkles className="h-3.5 w-3.5" />
            {t("feedback.eyebrow")}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("feedback.title")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("feedback.description")}
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-white/5 bg-[#14151B] p-6 transition-all hover:border-[#E84142]/30"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="rounded border border-[#E84142]/20 bg-[#E84142]/15 px-2 py-0.5 text-[10px] font-bold text-[#E84142]">
                    {item.badge}
                  </span>
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-slate-300">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={AVATARS[i]}
                    alt={item.name}
                    className="h-10 w-10 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">{item.role}</div>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-emerald-400">
                  {item.volume}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
