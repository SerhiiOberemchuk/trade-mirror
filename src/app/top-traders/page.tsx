import { traderRows } from "@/data/marketing";
import { PageHero, PublicShell, SectionHeader } from "@/components/public-shell";

const filters = ["Most profitable", "Lowest risk", "Most copied", "Highest win rate"] as const;

export default function TopTradersPage() {
  return (
    <PublicShell>
      <PageHero
        description="Trader discovery should feel like a performance dashboard, not a marketing page. This view previews ranking, risk, and copy decision density."
        eyebrow="Trader marketplace"
        title="Find copy traders by performance and risk"
      >
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {filters.map((filter, index) => (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  index === 0
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted"
                }`}
                key={filter}
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="Profiles are simulated until copy trading logic is implemented"
            title="Ranked providers"
          />
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {traderRows.map((trader) => (
              <article className="rounded-lg border border-border bg-background p-5" key={trader.name}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{trader.name}</h2>
                    <p className="mt-1 text-sm text-muted">{trader.strategy}</p>
                  </div>
                  <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">
                    {trader.risk} risk
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
                  <Metric label="PnL" tone="success" value={trader.pnl} />
                  <Metric label="Win" value={trader.winRate} />
                  <Metric label="Followers" value={trader.followers} />
                  <Metric label="Drawdown" value={trader.drawdown} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
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
