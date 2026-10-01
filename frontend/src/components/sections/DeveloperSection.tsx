import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CODE_SNIPPETS = {
  react: `import { AvaRampWidget } from '@avaramp/react-sdk';

export function CheckoutModal() {
  return (
    <AvaRampWidget
      partnerId="YOUR_PARTNER_API_KEY"
      defaultNetwork="avalanche-c"
      defaultToken="AVAX"
      fiatCurrency="VND"
      onSuccess={(tx) => console.log('Ramp complete on AVAX:', tx.hash)}
    />
  );
}`,
  js: `import { AvaRamp } from '@avaramp/sdk';

const ramp = new AvaRamp({
  apiKey: 'YOUR_PARTNER_API_KEY',
  network: 'avalanche-c',
});

// Launch on-ramp popup or redirect
ramp.open({
  cryptoAsset: 'USDC',
  fiatAmount: 1000000, // 1M VND
  walletAddress: userAccountAddress,
});`,
  api: `// POST https://api.avaramp.com/v1/orders
curl -X POST https://api.avaramp.com/v1/orders \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "buy",
    "token": "AVAX",
    "fiatAmount": 2000000,
    "fiatCurrency": "VND",
    "walletAddress": "0x3fA98eB73a11A9906660144d82fFe50091871C83"
  }'`,
};

type Tab = keyof typeof CODE_SNIPPETS;

const TABS: { key: Tab; labelKey: string }[] = [
  { key: "react", labelKey: "developers.tabReact" },
  { key: "js", labelKey: "developers.tabJs" },
  { key: "api", labelKey: "developers.tabApi" },
];

export const DeveloperSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("react");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="developers"
      className="relative border-t border-white/5 bg-[#0E0F14] py-24"
    >
      <div className="section-container relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E84142]/30 bg-[#E84142]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
              <Code className="h-3.5 w-3.5" />
              {t("developers.eyebrow")}
            </span>

            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              {t("developers.title")}
            </h2>

            <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
              {t("developers.subtitle")}
            </p>

            {/* Partner incentive card */}
            <div className="rounded-xl border border-[#E84142]/20 bg-linear-to-r from-[#E84142]/10 to-rose-500/5 p-4">
              <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[#E84142]">
                {t("developers.partnerBadge")}
              </div>
              <p className="text-xs text-slate-300">
                {t("developers.partnerDesc")}
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href={import.meta.env.VITE_TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E84142] px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#FF5A5B]"
              >
                <span>{t("developers.getKey")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://docs.avax.network"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
              >
                <span>{t("developers.docsBtn")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right column — code window */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14151B] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#181920] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="mr-3 flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-black/30 p-1">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                          activeTab === tab.key
                            ? "bg-[#E84142] text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {t(tab.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">
                        {t("developers.copied")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{t("developers.copyCode")}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto bg-[#101116] p-5 font-mono text-xs leading-relaxed text-slate-300 sm:text-sm">
                <pre>
                  <code>{CODE_SNIPPETS[activeTab]}</code>
                </pre>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 bg-[#181920] px-5 py-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-mono text-[11px]">
                    npm install @avaramp/react-sdk
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  v2.4.0 • Avalanche C-Chain
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
