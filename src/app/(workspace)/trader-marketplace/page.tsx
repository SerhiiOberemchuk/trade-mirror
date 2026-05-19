import { traderRows } from "@/data/marketing";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function TraderMarketplacePage() {
  return (
    <>
      <DashboardPageHeader
        action={
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted">
            Publish profile
          </button>
        }
        description="Marketplace cards for reviewing copy providers, filters, and risk summaries."
        title="Trader Marketplace"
      />

      <DashboardCard description="Provider cards are static until user profiles exist" title="Providers">
        <div className="grid gap-4 lg:grid-cols-2">
          {traderRows.map((trader) => (
            <article className="rounded-lg border border-border bg-background p-5" key={trader.name}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{trader.name}</h2>
                  <p className="mt-1 text-sm text-muted">{trader.strategy}</p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">
                  {trader.risk}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
                <Metric label="PnL" tone="success" value={trader.pnl} />
                <Metric label="Win" value={trader.winRate} />
                <Metric label="Followers" value={trader.followers} />
                <Metric label="DD" value={trader.drawdown} />
              </div>
              <button className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950">
                Copy preview
              </button>
            </article>
          ))}
        </div>
      </DashboardCard>
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-mono font-semibold ${tone === "success" ? "text-success" : ""}`}>
        {value}
      </p>
    </div>
  );
}
