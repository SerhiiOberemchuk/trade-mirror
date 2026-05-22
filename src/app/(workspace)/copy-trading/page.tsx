import { db } from "@/db";
import {
  copySettingsSchema,
  traderProfilesSchema,
} from "@/db/schema/copy-trading.schema";
import {
  simulatedPositionsSchema,
  simulatedTradesSchema,
} from "@/db/schema/trading.schema";
import { ActionToolbar } from "@/components/dashboard/primitives";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatTile,
  StatusBadge,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { and, desc, eq } from "drizzle-orm";
import { pauseCopySettingAction, resumeCopySettingAction } from "./actions";

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

type CopyExecutionRow = {
  action: "open" | "close";
  id: string;
  pair: string;
  pnl: string;
  pnlCents: number;
  side: "long" | "short";
  time: string;
  value: string;
};

export default async function CopyTradingPage() {
  const session = await requireSession();
  const state = await getCopyTradingState(session.user.id);

  const stats =
    state.kind === "ready"
      ? [
          {
            label: "Active providers",
            value: String(state.activeCount),
            change: `${state.pausedCount} paused`,
          },
          {
            label: "Allocated capital",
            value: formatMoney(state.allocatedCents, "USD"),
            change: "simulated",
          },
          {
            label: "Copy PnL",
            value: formatSignedMoney(state.copyPnlCents, "USD"),
            change: "from copied closes",
          },
          {
            label: "Copy win rate",
            value: formatBps(state.copyWinRateBps),
            change: `${state.copiedClosedCount} closed copies`,
          },
        ]
      : [
          { label: "Active providers", value: "n/a", change: "setup required" },
          {
            label: "Allocated capital",
            value: "n/a",
            change: "setup required",
          },
          { label: "Copy PnL", value: "n/a", change: "setup required" },
          { label: "Copy win rate", value: "n/a", change: "setup required" },
        ];

  return (
    <>
      <DashboardPageHeader
        description="Configure simulated provider allocations, copy ratio, and risk boundaries."
        title="Copy Trading"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatTile
            change={stat.change}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      {state.kind === "ready" ? (
        <section className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <DashboardCard description="Open copied positions created by copy automation" title="Copied exposure">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Open copied positions" value={String(state.copiedOpenCount)} />
              <MetricCard label="Open copied notional" value={formatMoney(state.copiedOpenNotionalCents, "USD")} />
              <MetricCard label="Closed copy executions" value={String(state.copiedClosedCount)} />
            </div>
          </DashboardCard>

          <DashboardCard description="Latest copied open and close executions" title="Copy execution history">
            {state.recentExecutions.length > 0 ? (
              <div className="space-y-3">
                {state.recentExecutions.map((execution) => (
                  <div className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[0.8fr_0.6fr_0.6fr_0.7fr_0.8fr] md:items-center" key={execution.id}>
                    <div>
                      <p className="font-medium">{execution.pair}</p>
                      <p className="text-xs text-muted">{execution.time}</p>
                    </div>
                    <StatusBadge tone={execution.action === "open" ? "primary" : "muted"}>{execution.action}</StatusBadge>
                    <StatusBadge tone={execution.side === "long" ? "success" : "danger"}>{execution.side}</StatusBadge>
                    <p className="font-mono text-muted">{execution.value}</p>
                    <p className={`font-mono ${execution.pnlCents >= 0 ? "text-success" : "text-danger"}`}>
                      {execution.pnl}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Copied executions will appear after a provider opens or closes a simulated position."
                title="No copied executions"
              />
            )}
          </DashboardCard>
        </section>
      ) : null}

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <DashboardCard
          description="Persisted copy relationships"
          title="Allocations"
        >
          {state.kind === "ready" && state.allocations.length > 0 ? (
            <div className="space-y-3">
              {state.allocations.map((allocation) => (
                <div
                  className="rounded-lg border border-border bg-background p-4"
                  key={allocation.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{allocation.trader}</p>
                    <StatusBadge
                      tone={
                        allocation.status === "active" ? "success" : "warning"
                      }
                    >
                      {allocation.status}
                    </StatusBadge>
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

        <DashboardCard
          description="Published providers ordered by simulated monthly PnL"
          title="Suggested traders"
        >
          {state.kind === "ready" && state.suggested.length > 0 ? (
            <div className="space-y-3">
              {state.suggested.map((trader) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                  key={trader.id}
                >
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

function CopyAllocationActions({
  allocation,
}: {
  allocation: CopyAllocationRow;
}) {
  return (
    <ActionToolbar>
      {allocation.status === "active" ? (
        <form action={pauseCopySettingFormAction}>
          <input name="settingId" type="hidden" value={allocation.id} />
          <button
            className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
            type="submit"
          >
            Pause
          </button>
        </form>
      ) : (
        <form action={resumeCopySettingFormAction}>
          <input name="settingId" type="hidden" value={allocation.id} />
          <button
            className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
            type="submit"
          >
            Resume
          </button>
        </form>
      )}
    </ActionToolbar>
  );
}

async function pauseCopySettingFormAction(formData: FormData) {
  "use server";

  await pauseCopySettingAction(formData);
}

async function resumeCopySettingFormAction(formData: FormData) {
  "use server";

  await resumeCopySettingAction(formData);
}

async function getCopyTradingState(userId: string): Promise<
  | {
      kind: "ready";
      allocations: CopyAllocationRow[];
      suggested: SuggestedTraderRow[];
      activeCount: number;
      pausedCount: number;
      allocatedCents: number;
      copyPnlCents: number;
      copyWinRateBps: number;
      copiedClosedCount: number;
      copiedOpenCount: number;
      copiedOpenNotionalCents: number;
      recentExecutions: CopyExecutionRow[];
    }
  | { kind: "setup-required" }
> {
  try {
    const [settingsRows, profileRows, copyTradeRows, copiedPositionRows] = await Promise.all([
      db
        .select()
        .from(copySettingsSchema)
        .where(eq(copySettingsSchema.followerUserId, userId))
        .orderBy(desc(copySettingsSchema.updatedAt)),
      db
        .select()
        .from(traderProfilesSchema)
        .where(eq(traderProfilesSchema.status, "published"))
        .orderBy(desc(traderProfilesSchema.monthlyPnlBps)),
      db
        .select()
        .from(simulatedTradesSchema)
        .where(
          and(
            eq(simulatedTradesSchema.userId, userId),
            eq(simulatedTradesSchema.source, "copy"),
          ),
        )
        .orderBy(desc(simulatedTradesSchema.executedAt)),
      db
        .select()
        .from(simulatedPositionsSchema)
        .where(
          and(
            eq(simulatedPositionsSchema.userId, userId),
            eq(simulatedPositionsSchema.source, "copy"),
          ),
        ),
    ]);
    const closedCopyTrades = copyTradeRows.filter((row) => row.action === "close");
    const winningCopyTrades = closedCopyTrades.filter((row) => row.pnlCents > 0);
    const copiedOpenPositions = copiedPositionRows.filter((row) => row.status === "open");

    return {
      activeCount: settingsRows.filter((row) => row.status === "active").length,
      allocatedCents: settingsRows.reduce(
        (total, row) => total + row.allocationCents,
        0,
      ),
      copyPnlCents: copyTradeRows.reduce(
        (total, row) => total + row.pnlCents,
        0,
      ),
      copyWinRateBps:
        closedCopyTrades.length > 0
          ? Math.round((winningCopyTrades.length / closedCopyTrades.length) * 10_000)
          : 0,
      copiedClosedCount: closedCopyTrades.length,
      copiedOpenCount: copiedOpenPositions.length,
      copiedOpenNotionalCents: copiedOpenPositions.reduce(
        (total, row) => total + row.notionalCents,
        0,
      ),
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
      recentExecutions: copyTradeRows.slice(0, 8).map((row) => ({
        action: row.action,
        id: row.id,
        pair: row.pairSymbol,
        pnl: formatSignedMoney(row.pnlCents, "USD"),
        pnlCents: row.pnlCents,
        side: row.side,
        time: formatDateTime(row.executedAt),
        value: formatMoney(row.notionalCents, "USD"),
      })),
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-mono text-lg font-semibold">{value}</p>
    </div>
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

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    currency,
    style: "currency",
  }).format(amountCents / 100);
}

function formatSignedMoney(amountCents: number, currency: string) {
  const value = formatMoney(Math.abs(amountCents), currency);

  return `${amountCents >= 0 ? "+" : "-"}${value}`;
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}
