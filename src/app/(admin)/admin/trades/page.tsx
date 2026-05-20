import { db } from "@/db";
import { simulatedTradesSchema } from "@/db/schema/trading.schema";
import {
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";

type AdminTradeRow = {
  id: string;
  user: string;
  pair: string;
  side: "long" | "short";
  action: "open" | "close";
  source: "manual" | "copy";
  size: string;
  price: string;
  pnl: string;
  pnlCents: number;
  executed: string;
};

const tradeColumns = [
  {
    header: "ID",
    cell: (trade) => (
      <span className="font-mono text-muted">{trade.id.slice(0, 8)}</span>
    ),
  },
  {
    header: "User",
    cell: (trade) => <span className="font-medium">{trade.user}</span>,
  },
  {
    header: "Pair",
    cell: (trade) => trade.pair,
  },
  {
    header: "Side",
    cell: (trade) => (
      <StatusBadge tone={trade.side === "long" ? "success" : "danger"}>
        {trade.side}
      </StatusBadge>
    ),
  },
  {
    header: "Action",
    cell: (trade) => <span className="text-muted">{trade.action}</span>,
  },
  {
    header: "Source",
    cell: (trade) => <span className="text-muted">{trade.source}</span>,
  },
  {
    header: "Size",
    cell: (trade) => <span className="font-mono">{trade.size}</span>,
  },
  {
    header: "Price",
    cell: (trade) => (
      <span className="font-mono text-muted">{trade.price}</span>
    ),
  },
  {
    header: "PnL",
    cell: (trade) => (
      <span
        className={
          trade.pnlCents >= 0
            ? "font-mono text-success"
            : "font-mono text-danger"
        }
      >
        {trade.pnl}
      </span>
    ),
  },
  {
    header: "Executed",
    cell: (trade) => (
      <span className="font-mono text-muted">{trade.executed}</span>
    ),
  },
] as const satisfies readonly DataTableColumn<AdminTradeRow>[];

export default async function AdminTradesPage() {
  const state = await getAdminTradeRows();

  return (
    <>
      <AdminPageHeader
        description="Platform-level monitor for simulated manual and copied trade executions."
        title="Trades History"
      />

      <AdminCard description="Recent simulated trade activity" title="Trades">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={tradeColumns}
            getRowKey={(trade) => trade.id}
            minWidth="1180px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Simulated trades will appear here after users open or close positions."
            title="No simulated trades"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted trade monitoring."
            title="Trade table is not ready"
          />
        ) : null}
      </AdminCard>
    </>
  );
}

async function getAdminTradeRows(): Promise<
  { kind: "ready"; rows: AdminTradeRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(simulatedTradesSchema)
      .orderBy(desc(simulatedTradesSchema.executedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        action: row.action,
        executed: formatDate(row.executedAt),
        id: row.id,
        pair: row.pairSymbol,
        pnl: formatSignedMoney(row.pnlCents, "USD"),
        pnlCents: row.pnlCents,
        price: formatMoney(row.priceCents, "USD"),
        side: row.side,
        size: formatMoney(row.notionalCents, "USD"),
        source: row.source,
        user: row.userName,
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
