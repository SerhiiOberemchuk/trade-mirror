import { featureCards, platformStats } from "@/data/marketing";
import {
  MarketWatchPanel,
  TopTradersPanel,
  TradingTerminalPreview,
} from "@/components/market-panels";
import { InfoCard, PageHero, PublicShell } from "@/components/public-shell";

export default function Home() {
  return (
    <PublicShell>
      <PageHero
        description="Premium FinTech workspace for testing crypto strategies, publishing trader profiles, and copying simulated trades with transparent risk controls."
        eyebrow="Demo balances. Real market rhythm. No live financial operations."
        title="TradeMirror copy trading simulation"
      >
        <TradingTerminalPreview />
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-3 px-5 py-6 sm:grid-cols-3 lg:px-8">
        {platformStats.map(([value, label]) => (
          <div className="rounded-lg border border-border bg-card p-4" key={label}>
            <p className="text-xl font-semibold">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-4 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <TopTradersPanel />
        <MarketWatchPanel />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-3 lg:px-8">
        {featureCards.map(([title, description]) => (
          <InfoCard description={description} key={title} title={title} />
        ))}
      </section>
    </PublicShell>
  );
}
