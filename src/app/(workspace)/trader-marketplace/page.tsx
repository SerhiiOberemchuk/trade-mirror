import { db } from "@/db";
import { traderProfilesSchema } from "@/db/schema/copy-trading.schema";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-shell";
import { desc, eq } from "drizzle-orm";
import { publishTraderProfileAction, startCopyTradingAction } from "./actions";

type TraderProfileRow = {
  id: string;
  name: string;
  strategy: string;
  risk: "low" | "medium" | "high";
  pnl: string;
  winRate: string;
  followers: string;
  drawdown: string;
};

export default async function TraderMarketplacePage() {
  const state = await getTraderProfiles();

  return (
    <>
      <DashboardPageHeader
        description="Persisted provider profiles with simulated copy allocation controls."
        title="Trader Marketplace"
      />

      <section className="grid gap-5 xl:grid-cols-[0.65fr_1.35fr]">
        <DashboardCard
          description="Publish a simulated provider profile"
          title="Publish profile"
        >
          <form action={publishTraderProfileAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Display name</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={80}
                minLength={3}
                name="displayName"
                placeholder="Mira Quant"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Strategy</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={120}
                minLength={3}
                name="strategy"
                placeholder="Momentum grid"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Risk</span>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="medium"
                name="riskLevel"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium">Monthly PnL</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  defaultValue="24"
                  max="300"
                  min="-100"
                  name="monthlyPnl"
                  step="0.01"
                  type="number"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Win rate</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  defaultValue="68"
                  max="100"
                  min="0"
                  name="winRate"
                  step="0.01"
                  type="number"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Drawdown</span>
                <input
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  defaultValue="8"
                  max="100"
                  min="0"
                  name="maxDrawdown"
                  step="0.01"
                  type="number"
                />
              </label>
            </div>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Publish profile
            </button>
          </form>
        </DashboardCard>

        <DashboardCard
          description="Published simulated copy providers"
          title="Providers"
        >
          {state.kind === "ready" && state.rows.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {state.rows.map((trader) => (
                <article
                  className="rounded-lg border border-border bg-background p-5"
                  key={trader.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{trader.name}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {trader.strategy}
                      </p>
                    </div>
                    <StatusBadge tone={getRiskTone(trader.risk)}>
                      {trader.risk}
                    </StatusBadge>
                  </div>
                  <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
                    <Metric label="PnL" tone="success" value={trader.pnl} />
                    <Metric label="Win" value={trader.winRate} />
                    <Metric label="Followers" value={trader.followers} />
                    <Metric label="DD" value={trader.drawdown} />
                  </div>
                  <form
                    action={startCopyTradingAction}
                    className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      name="traderProfileId"
                      type="hidden"
                      value={trader.id}
                    />
                    <label className="block">
                      <span className="sr-only">Allocation</span>
                      <input
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        defaultValue="1000"
                        min="10"
                        name="allocation"
                        step="0.01"
                        type="number"
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Copy ratio</span>
                      <input
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        defaultValue="25"
                        max="100"
                        min="1"
                        name="copyRatio"
                        step="0.01"
                        type="number"
                      />
                    </label>
                    <button
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
                      type="submit"
                    >
                      Copy
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Publish a provider profile to make copy allocation controls available."
              title="No trader profiles"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted trader profiles."
              title="Trader profiles are not ready"
            />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

async function getTraderProfiles(): Promise<
  { kind: "ready"; rows: TraderProfileRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(traderProfilesSchema)
      .where(eq(traderProfilesSchema.status, "published"))
      .orderBy(desc(traderProfilesSchema.monthlyPnlBps));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        drawdown: formatBps(row.maxDrawdownBps),
        followers: new Intl.NumberFormat("en", { notation: "compact" }).format(
          row.followersCount,
        ),
        id: row.id,
        name: row.displayName,
        pnl: formatSignedBps(row.monthlyPnlBps),
        risk: row.riskLevel,
        strategy: row.strategy,
        winRate: formatBps(row.winRateBps),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
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
      <p
        className={`mt-1 font-mono font-semibold ${tone === "success" ? "text-success" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(1)}%`;
}

function formatSignedBps(value: number) {
  return `${value >= 0 ? "+" : ""}${formatBps(value)}`;
}

function getRiskTone(risk: TraderProfileRow["risk"]) {
  if (risk === "high") {
    return "danger";
  }

  if (risk === "medium") {
    return "warning";
  }

  return "success";
}
