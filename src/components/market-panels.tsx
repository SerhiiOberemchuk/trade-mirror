import { chartBars, marketRows, traderRows } from "@/data/marketing";
import { SectionHeader } from "@/components/public-shell";
import { routes } from "@/lib/routes";

export function TradingTerminalPreview() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold">BTC/USDT terminal</p>
          <p className="text-xs text-muted">Simulated execution preview</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-success/10 px-2 py-1 font-medium text-success">
            Live
          </span>
          <span className="font-mono text-muted">1m</span>
          <span className="font-mono text-muted">5m</span>
          <span className="font-mono text-foreground">1h</span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="min-h-[360px] border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-3xl font-semibold">$103,842.10</p>
              <p className="mt-1 text-sm text-success">+2.41% today</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-right text-xs text-muted">
              <MarketMeta label="High" value="$105,120" />
              <MarketMeta label="Low" value="$101,280" />
              <MarketMeta label="Vol" value="$18.2B" />
            </div>
          </div>

          <div className="flex h-64 items-end gap-2 rounded-lg border border-border bg-background/70 p-4">
            {chartBars.map((height, index) => (
              <div className="flex flex-1 items-end" key={`${height}-${index}`}>
                <div
                  className={`w-full rounded-t-sm ${
                    index % 3 === 2 ? "bg-danger" : "bg-primary"
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="p-5">
          <div className="mb-5 flex rounded-lg border border-border bg-background p-1">
            <button className="flex-1 rounded-md bg-success px-3 py-2 text-sm font-semibold text-slate-950">
              Buy
            </button>
            <button className="flex-1 rounded-md px-3 py-2 text-sm font-semibold text-muted">
              Sell
            </button>
          </div>

          <div className="space-y-3">
            {[
              ["Order size", "$2,500"],
              ["Take profit", "+8.0%"],
              ["Stop loss", "-3.5%"],
              ["Copy ratio", "40%"],
            ].map(([label, value]) => (
              <div
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-3"
                key={label}
              >
                <span className="text-sm text-muted">{label}</span>
                <span className="font-mono text-sm">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MarketMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p>{label}</p>
      <p className="mt-1 font-mono text-foreground">{value}</p>
    </div>
  );
}

export function TopTradersPanel() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <SectionHeader
        action={
          <a className="text-sm font-medium text-primary" href={routes.topTraders}>
            View all
          </a>
        }
        description="Ranked by simulated monthly performance"
        title="Top copy traders"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-border">
              <th className="px-5 py-3 font-medium">Trader</th>
              <th className="px-5 py-3 font-medium">Strategy</th>
              <th className="px-5 py-3 font-medium">Monthly PnL</th>
              <th className="px-5 py-3 font-medium">Win rate</th>
              <th className="px-5 py-3 font-medium">Risk</th>
              <th className="px-5 py-3 font-medium">Followers</th>
            </tr>
          </thead>
          <tbody>
            {traderRows.map((trader) => (
              <tr className="border-b border-border/70 last:border-0" key={trader.name}>
                <td className="px-5 py-4 font-medium">{trader.name}</td>
                <td className="px-5 py-4 text-muted">{trader.strategy}</td>
                <td className="px-5 py-4 font-mono text-success">{trader.pnl}</td>
                <td className="px-5 py-4 font-mono">{trader.winRate}</td>
                <td className="px-5 py-4">
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">
                    {trader.risk}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono">{trader.followers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MarketWatchPanel() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <SectionHeader
        description="Demo prices for core trading pairs"
        title="Market watch"
      />
      <div className="divide-y divide-border">
        {marketRows.slice(0, 4).map((market) => (
          <div
            className="grid grid-cols-4 items-center gap-3 px-5 py-4 text-sm"
            key={market.pair}
          >
            <div className="font-semibold">{market.pair}</div>
            <div className="font-mono text-foreground">{market.price}</div>
            <div
              className={`font-mono ${
                market.change.startsWith("+") ? "text-success" : "text-danger"
              }`}
            >
              {market.change}
            </div>
            <div className="text-right font-mono text-muted">{market.volume}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
