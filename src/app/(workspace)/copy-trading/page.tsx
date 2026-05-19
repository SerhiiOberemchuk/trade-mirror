import { copyAllocations } from "@/data/dashboard";
import { traderRows } from "@/data/marketing";
import { DashboardCard, DashboardPageHeader, StatTile } from "@/components/dashboard-shell";

const copyStats = [
  { label: "Active providers", value: "2", change: "1 paused" },
  { label: "Allocated capital", value: "$55,700", change: "44% of equity" },
  { label: "Copy PnL", value: "+$2,418", change: "+4.3%" },
] as const;

export default function CopyTradingPage() {
  return (
    <>
      <DashboardPageHeader
        description="Configure simulated provider allocations, copy ratio, and risk boundaries before automation logic exists."
        title="Copy Trading"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {copyStats.map((stat) => (
          <StatTile change={stat.change} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <DashboardCard description="Current copy relationships" title="Allocations">
          <div className="space-y-3">
            {copyAllocations.map((allocation) => (
              <div className="rounded-lg border border-border bg-background p-4" key={allocation.trader}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{allocation.trader}</p>
                  <span className="text-sm text-primary">{allocation.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <Metric label="Capital" value={allocation.allocation} />
                  <Metric label="Ratio" value={allocation.copyRatio} />
                  <Metric label="Risk" value={allocation.risk} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Available provider previews" title="Suggested traders">
          <div className="space-y-3">
            {traderRows.slice(0, 3).map((trader) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3" key={trader.name}>
                <div>
                  <p className="font-medium">{trader.name}</p>
                  <p className="mt-1 text-sm text-muted">{trader.strategy}</p>
                </div>
                <p className="font-mono text-sm text-success">{trader.pnl}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}
