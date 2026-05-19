import { marketRows } from "@/data/marketing";
import { TradingTerminalPreview } from "@/components/market-panels";
import { PageHero, PublicShell, SectionHeader } from "@/components/public-shell";

const marketStats = [
  ["$32.8B", "24h demo volume"],
  ["0.04%", "avg spread"],
  ["6", "active pairs"],
] as const;

export default function MarketsPage() {
  return (
    <PublicShell>
      <PageHero
        description="Review the market surface before any trading logic is connected. The goal is a clear, dense workspace for pair scanning and terminal access."
        eyebrow="Market overview"
        title="Crypto markets with a trading-desk layout"
      >
        <TradingTerminalPreview />
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-3 px-5 py-6 sm:grid-cols-3 lg:px-8">
        {marketStats.map(([value, label]) => (
          <div className="rounded-lg border border-border bg-card p-4" key={label}>
            <p className="font-mono text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="Static demo data for reviewing table density and hierarchy"
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
                {marketRows.map((market) => (
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
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
