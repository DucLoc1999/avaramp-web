import { useMemo, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Search,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContactSupportModal } from "../ui/ContactSupportModal";

type FaqItem = {
  category: string;
  question: string;
  answer: string;
};

const CATEGORY_IDS = ["all", "general", "fees", "security", "integration"];

export const FaqSection = () => {
  const { t } = useTranslation();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [supportOpen, setSupportOpen] = useState(false);

  const items = t("faq.items", { returnObjects: true }) as FaqItem[];

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  const activeQuestion = openQuestion ?? filtered[0]?.question ?? null;

  return (
    <section
      id="faq"
      className="relative border-t border-white/5 bg-[#0E0F14] py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
            <HelpCircle className="h-3.5 w-3.5" />
            {t("faq.eyebrow")}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("faq.title")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
            {t("faq.subtitle")}
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-4 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("faq.searchPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-[#14151B] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-[#E84142] focus:outline-none"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {CATEGORY_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  category === id
                    ? "bg-[#E84142] text-white"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {t(`faq.categories.${id}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              {t("faq.noResults")}
            </p>
          ) : (
            filtered.map((item) => {
              const isOpen = activeQuestion === item.question;
              return (
                <div
                  key={item.question}
                  className="overflow-hidden rounded-xl border border-white/5 bg-[#14151B] transition-colors hover:border-white/15"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenQuestion(isOpen ? null : item.question)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-white transition-colors hover:text-[#E84142] sm:text-base"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#E84142]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/5 px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-linear-to-r from-[#14151B] to-[#1C1D26] p-6 sm:flex-row">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E84142]/20 bg-[#E84142]/10 text-[#E84142]">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                {t("faq.support.title")}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {t("faq.support.description")}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#E84142] px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#FF5A5B]"
          >
            <span>{t("faq.support.button")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ContactSupportModal
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </section>
  );
};
