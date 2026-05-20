import { db } from "@/db";
import { copySettings, traderProfiles } from "@/db/schema";
import { ActionToolbar } from "@/components/dashboard/primitives";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatTile,
  StatusBadge,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { desc, eq } from "drizzle-orm";
import {
  pauseCopySettingAction,
  resumeCopySettingAction,
} from "./actions";

type CopyAllocationRow = {
  id: string;
  trader: string;
  allocation: string;
  copyRatio: string;
  status: "active" | "paused";
  updated: string;
};

type SuggestedTraderRow = {
  id: string;
  name: string;
  strategy: string;
  pnl: string;
};

export default async function CopyTradingPage() {
  const session = await requireSession();
  const state = await getCopyTradingState(session.user.id);

  const stats =
    state.kind === "ready"
      ? [
          { label: "Active providers", value: String(state.activeCount), change: `${state.pausedCount} paused` },
          { label: "Allocated capital", value: formatMoney(state.allocatedCents, "USD"), change: "simulated" },
          { label: "Copy PnL", value: "+$0.00", change: "pending copy engine" },
        ]
      : [
          { label: "Active providers", value: "n/a", change: "setup required" },
          { label: "Allocated capital", value: "n/a", change: "setup required" },
          { label: "Copy PnL", value: "n/a", change: "setup required" },
        ];

  return (
    <>
      <DashboardPageHeader
        description="Configure simulated provider allocations, copy ratio, and risk boundaries."
        title="Copy Trading"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatTile change={stat.change} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <DashboardCard description="Persisted copy relationships" title="Allocations">
          {state.kind === "ready" && state.allocations.length > 0 ? (
            <div className="space-y-3">
              {state.allocations.map((allocation) => (
                <div className="rounded-lg border border-border bg-background p-4" key={allocation.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{allocation.trader}</p>
                    <StatusBadge tone={allocation.status === "active" ? "success" : "warning"}>{allocation.status}</StatusBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <Metric label="Capital" value={allocation.allocation} />
                    <Metric label="Ratio" value={allocation.copyRatio} />
                    <Metric label="Updated" value={allocation.updated} />
                  </div>
                  <div className="mt-4">
                    <CopyAllocationActions allocation={allocation} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.allocations.length === 0 ? (
            <EmptyState
              description="Start copying a provider from the marketplace and the allocation will appear here."
              title="No copy allocations"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted copy settings."
              title="Copy settings are not ready"
            />
          ) : null}
        </DashboardCard>

        <DashboardCard description="Published providers ordered by simulated monthly PnL" title="Suggested traders">
          {state.kind === "ready" && state.suggested.length > 0 ? (
            <div className="space-y-3">
              {state.suggested.map((trader) => (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3" key={trader.id}>
                  <div>
                    <p className="font-medium">{trader.name}</p>
                    <p className="mt-1 text-sm text-muted">{trader.strategy}</p>
                  </div>
                  <p className="font-mono text-sm text-success">{trader.pnl}</p>
                </div>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.suggested.length === 0 ? (
            <EmptyState title="No published providers" />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState title="Trader profiles are not ready" />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

function CopyAllocationActions({ allocation }: { allocation: CopyAllocationRow }) {
  return (
    <ActionToolbar>
      {allocation.status === "active" ? (
        <form action={pauseCopySettingAction}>
          <input name="settingId" type="hidden" value={allocation.id} />
          <button className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300" type="submit">
            Pause
          </button>
        </form>
      ) : (
        <form action={resumeCopySettingAction}>
          <input name="settingId" type="hidden" value={allocation.id} />
          <button className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300" type="submit">
            Resume
          </button>
        </form>
      )}
    </ActionToolbar>
  );
}

async function getCopyTradingState(userId: string): Promise<
  | {
      kind: "ready";
      allocations: CopyAllocationRow[];
      suggested: SuggestedTraderRow[];
      activeCount: number;
      pausedCount: number;
      allocatedCents: number;
    }
  | { kind: "setup-required" }
> {
  try {
    const [settingsRows, profileRows] = await Promise.all([
      db
        .select()
        .from(copySettings)
        .where(eq(copySettings.followerUserId, userId))
        .orderBy(desc(copySettings.updatedAt)),
      db
        .select()
        .from(traderProfiles)
        .where(eq(traderProfiles.status, "published"))
        .orderBy(desc(traderProfiles.monthlyPnlBps)),
    ]);

    return {
      activeCount: settingsRows.filter((row) => row.status === "active").length,
      allocatedCents: settingsRows.reduce((total, row) => total + row.allocationCents, 0),
      allocations: settingsRows.map((row) => ({
        allocation: formatMoney(row.allocationCents, "USD"),
        copyRatio: formatBps(row.copyRatioBps),
        id: row.id,
        status: row.status,
        trader: row.traderName,
        updated: formatDate(row.updatedAt),
      })),
      kind: "ready",
      pausedCount: settingsRows.filter((row) => row.status === "paused").length,
      suggested: profileRows.slice(0, 3).map((row) => ({
        id: row.id,
        name: row.displayName,
        pnl: formatSignedBps(row.monthlyPnlBps),
        strategy: row.strategy,
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono font-semibold">{value}</p>
    </div>
  );
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    currency,
    style: "currency",
  }).format(amountCents / 100);
}

function formatBps(value: number) {
  return `${(value / 100).toFixed(1)}%`;
}

function formatSignedBps(value: number) {
  return `${value >= 0 ? "+" : ""}${formatBps(value)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
