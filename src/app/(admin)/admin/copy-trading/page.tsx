import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import {
  simulatedPositionsSchema,
  simulatedTradesSchema,
} from "@/db/schema/trading.schema";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatTile,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc, eq } from "drizzle-orm";

type AdminCopyActivityRow = {
  id: string;
  leader: string;
  follower: string;
  ratio: string;
  allocation: string;
  status: "active" | "paused";
  updated: string;
};

type AdminCopyExecutionRow = {
  action: "open" | "close";
  follower: string;
  id: string;
  pair: string;
  pnl: string;
  pnlCents: number;
  time: string;
};

const copyColumns = [
  {
    header: "Provider",
    cell: (activity) => <span className="font-medium">{activity.leader}</span>,
  },
  {
    header: "Follower",
    cell: (activity) => <span className="text-muted">{activity.follower}</span>,
  },
  {
    header: "Ratio",
    cell: (activity) => <span className="font-mono">{activity.ratio}</span>,
  },
  {
    header: "Allocation",
    cell: (activity) => (
      <span className="font-mono text-muted">{activity.allocation}</span>
    ),
  },
  {
    header: "Status",
    cell: (activity) => (
      <StatusBadge tone={activity.status === "active" ? "success" : "warning"}>
        {activity.status}
      </StatusBadge>
    ),
  },
  {
    header: "Updated",
    cell: (activity) => (
      <span className="font-mono text-muted">{activity.updated}</span>
    ),
  },
] as const satisfies readonly DataTableColumn<AdminCopyActivityRow>[];

export default async function AdminCopyTradingPage() {
  const state = await getAdminCopyActivityState();

  return (
    <>
      <AdminPageHeader
        description="Administrative monitor for simulated copy relationships between providers and followers."
        title="Copy Trading Activity"
      />

      {state.kind === "ready" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatTile
            change={`${state.pausedSettingsCount} paused`}
            label="Active copy settings"
            value={String(state.activeSettingsCount)}
          />
          <AdminStatTile
            change="Across active and paused settings"
            label="Allocated capital"
            value={formatMoney(state.allocatedCents, "USD")}
          />
          <AdminStatTile
            change={`${state.openCopiedPositionsCount} open copied positions`}
            label="Copied exposure"
            value={formatMoney(state.openCopiedNotionalCents, "USD")}
          />
          <AdminStatTile
            change={`${state.closedCopiedTradesCount} copied closes`}
            label="Copied PnL"
            value={formatSignedMoney(state.copiedPnlCents, "USD")}
          />
        </section>
      ) : null}

      <AdminCard description="Provider/follower links" title="Copy activity">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={copyColumns}
            getRowKey={(activity) => activity.id}
            minWidth="920px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Copy settings will appear here after users start copying trader profiles."
            title="No copy activity"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted copy trading monitoring."
            title="Copy settings are not ready"
          />
        ) : null}
      </AdminCard>

      {state.kind === "ready" ? (
        <section className="mt-6">
          <AdminCard
            description="Latest platform-level copied trade executions"
            title="Copied execution stream"
          >
            {state.executions.length > 0 ? (
              <div className="space-y-3">
                {state.executions.map((execution) => (
                  <div
                    className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[0.8fr_0.8fr_0.6fr_0.7fr_0.8fr] md:items-center"
                    key={execution.id}
                  >
                    <div>
                      <p className="font-medium">{execution.pair}</p>
                      <p className="text-xs text-muted">{execution.time}</p>
                    </div>
                    <p className="text-muted">{execution.follower}</p>
                    <StatusBadge tone={execution.action === "open" ? "primary" : "muted"}>
                      {execution.action}
                    </StatusBadge>
                    <p className={`font-mono ${execution.pnlCents >= 0 ? "text-success" : "text-danger"}`}>
                      {execution.pnl}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Copied executions will appear after providers open or close simulated positions."
                title="No copied executions"
              />
            )}
          </AdminCard>
        </section>
      ) : null}
    </>
  );
}

async function getAdminCopyActivityState(): Promise<
  | {
      activeSettingsCount: number;
      allocatedCents: number;
      closedCopiedTradesCount: number;
      copiedPnlCents: number;
      executions: AdminCopyExecutionRow[];
      kind: "ready";
      openCopiedNotionalCents: number;
      openCopiedPositionsCount: number;
      pausedSettingsCount: number;
      rows: AdminCopyActivityRow[];
    }
  | { kind: "setup-required" }
> {
  try {
    const [rows, copiedPositionRows, copiedTradeRows] = await Promise.all([
      db
        .select()
        .from(copySettingsSchema)
        .orderBy(desc(copySettingsSchema.updatedAt)),
      db
        .select()
        .from(simulatedPositionsSchema)
        .where(eq(simulatedPositionsSchema.source, "copy"))
        .orderBy(desc(simulatedPositionsSchema.openedAt)),
      db
        .select()
        .from(simulatedTradesSchema)
        .where(eq(simulatedTradesSchema.source, "copy"))
        .orderBy(desc(simulatedTradesSchema.executedAt)),
    ]);
    const openCopiedPositions = copiedPositionRows.filter((row) => row.status === "open");
    const closedCopiedTrades = copiedTradeRows.filter((row) => row.action === "close");

    return {
      activeSettingsCount: rows.filter((row) => row.status === "active").length,
      allocatedCents: rows.reduce((total, row) => total + row.allocationCents, 0),
      closedCopiedTradesCount: closedCopiedTrades.length,
      copiedPnlCents: closedCopiedTrades.reduce((total, row) => total + row.pnlCents, 0),
      executions: copiedTradeRows.slice(0, 10).map((row) => ({
        action: row.action,
        follower: row.userName,
        id: row.id,
        pair: row.pairSymbol,
        pnl: formatSignedMoney(row.pnlCents, "USD"),
        pnlCents: row.pnlCents,
        time: formatDateTime(row.executedAt),
      })),
      kind: "ready",
      openCopiedNotionalCents: openCopiedPositions.reduce(
        (total, row) => total + row.notionalCents,
        0,
      ),
      openCopiedPositionsCount: openCopiedPositions.length,
      pausedSettingsCount: rows.filter((row) => row.status === "paused").length,
      rows: rows.map((row) => ({
        allocation: formatMoney(row.allocationCents, "USD"),
        follower: row.followerName,
        id: row.id,
        leader: row.traderName,
        ratio: formatBps(row.copyRatioBps),
        status: row.status,
        updated: formatDate(row.updatedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
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

function formatSignedMoney(amountCents: number, currency: string) {
  const value = formatMoney(Math.abs(amountCents), currency);

  return `${amountCents >= 0 ? "+" : "-"}${value}`;
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
