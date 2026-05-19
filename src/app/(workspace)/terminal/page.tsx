import { marketRows } from "@/data/marketing";
import { openPositions } from "@/data/dashboard";
import { TradingTerminalPreview } from "@/components/market-panels";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function TerminalPage() {
  return (
    <>
      <DashboardPageHeader
        action={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950">
            New demo order
          </button>
        }
        description="Trading terminal layout for chart, order ticket, pair selector, and position monitoring."
        title="Trading Terminal"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <TradingTerminalPreview />
        <DashboardCard description="Quick pair selection" title="Pairs">
          <div className="space-y-2">
            {marketRows.map((market) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-3 text-sm" key={market.pair}>
                <span className="font-medium">{market.pair}</span>
                <span className={market.change.startsWith("+") ? "text-success" : "text-danger"}>
                  {market.change}
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="mt-6">
        <DashboardCard description="Positions created by manual and copied demo orders" title="Open positions">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium">Pair</th>
                  <th className="pb-3 font-medium">Side</th>
                  <th className="pb-3 font-medium">Size</th>
                  <th className="pb-3 font-medium">Entry</th>
                  <th className="pb-3 font-medium">PnL</th>
                </tr>
              </thead>
              <tbody>
                {openPositions.map((position) => (
                  <tr className="border-b border-border/70 last:border-0" key={position.pair}>
                    <td className="py-3 font-medium">{position.pair}</td>
                    <td className="py-3 text-muted">{position.side}</td>
                    <td className="py-3 font-mono">{position.size}</td>
                    <td className="py-3 font-mono text-muted">{position.entry}</td>
                    <td className={position.pnl.startsWith("+") ? "py-3 font-mono text-success" : "py-3 font-mono text-danger"}>{position.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </section>
    </>
  );
}
