import { TradingTerminalPreview } from "@/components/market-panels";
import { PageHero, PublicShell, SectionHeader } from "@/components/public-shell";
import { getPublicMarketsState } from "@/server/public/markets";
import { Suspense } from "react";

export default function MarketsPage() {
  return (
    <PublicShell>
      <PageHero
        description="Review enabled crypto pairs with real live pricing context before opening simulated trades in the authenticated terminal."
        eyebrow="Market overview"
        title="Crypto markets with a trading-desk layout"
      >
        <TradingTerminalPreview />
      </PageHero>

      <Suspense fallback={<MarketsSkeleton />}>
        <MarketsContent />
      </Suspense>
    </PublicShell>
  );
}

async function MarketsContent() {
  const markets = await getPublicMarketsState();

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-3 px-5 py-6 sm:grid-cols-3 lg:px-8">
        {[
          [markets.stats.volume24h, "24h live volume"],
          [markets.stats.averageSpread, "avg spread"],
          [markets.stats.activePairs, "active pairs"],
        ].map(([value, label]) => (
          <div className="rounded-lg border border-border bg-card p-4" key={label}>
            <p className="font-mono text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="Enabled platform pairs with normalized live market data when available"
            title="Trading pairs"
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Pair</th>
                  <th className="px-5 py-3 font-medium">Last price</th>
                  <th className="px-5 py-3 font-medium">24h change</th>
                  <th className="px-5 py-3 font-medium">Volume</th>
                  <th className="px-5 py-3 font-medium">Spread</th>
                </tr>
              </thead>
              <tbody>
                {markets.rows.map((market) => (
                  <tr className="border-b border-border/70 last:border-0" key={market.pair}>
                    <td className="px-5 py-4 font-semibold">{market.pair}</td>
                    <td className="px-5 py-4 font-mono">{market.price}</td>
                    <td
                      className={`px-5 py-4 font-mono ${
                        market.change.startsWith("+") ? "text-success" : "text-danger"
                      }`}
                    >
                      {market.change}
                    </td>
                    <td className="px-5 py-4 font-mono text-muted">{market.volume}</td>
                    <td className="px-5 py-4 font-mono text-muted">{market.spread}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {markets.rows.length === 0 ? (
              <div className="border-t border-border px-5 py-8 text-sm text-muted">
                No enabled trading pairs are available yet.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function MarketsSkeleton() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-3 px-5 py-6 sm:grid-cols-3 lg:px-8">
        {["volume", "spread", "pairs"].map((item) => (
          <div className="h-24 rounded-lg border border-border bg-card" key={item} />
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="h-96 rounded-lg border border-border bg-card" />
      </section>
    </>
  );
}
