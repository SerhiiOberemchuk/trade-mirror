import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import {
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";

type AdminCopyActivityRow = {
  id: string;
  leader: string;
  follower: string;
  ratio: string;
  allocation: string;
  status: "active" | "paused";
  updated: string;
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
  const state = await getAdminCopyActivityRows();

  return (
    <>
      <AdminPageHeader
        description="Administrative monitor for simulated copy relationships between providers and followers."
        title="Copy Trading Activity"
      />

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
    </>
  );
}

async function getAdminCopyActivityRows(): Promise<
  { kind: "ready"; rows: AdminCopyActivityRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(copySettingsSchema)
      .orderBy(desc(copySettingsSchema.updatedAt));

    return {
      kind: "ready",
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
