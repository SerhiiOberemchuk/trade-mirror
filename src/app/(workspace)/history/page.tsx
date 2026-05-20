import { db } from "@/db";
import { simulatedTrades } from "@/db/schema";
import { transactions } from "@/data/dashboard";
import {
  DashboardCard,
  DashboardPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { desc, eq } from "drizzle-orm";

type TradeHistoryRow = {
  id: string;
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
    header: "Pair",
    cell: (trade) => <span className="font-medium">{trade.pair}</span>,
  },
  {
    header: "Side",
    cell: (trade) => <StatusBadge tone={trade.side === "long" ? "success" : "danger"}>{trade.side}</StatusBadge>,
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
    cell: (trade) => <span className="font-mono text-muted">{trade.price}</span>,
  },
  {
    header: "PnL",
    cell: (trade) => (
      <span className={trade.pnlCents >= 0 ? "font-mono text-success" : "font-mono text-danger"}>
        {trade.pnl}
      </span>
    ),
  },
  {
    header: "Executed",
    cell: (trade) => <span className="font-mono text-muted">{trade.executed}</span>,
  },
] as const satisfies readonly DataTableColumn<TradeHistoryRow>[];

export default async function HistoryPage() {
  const session = await requireSession();
  const state = await getTradeHistory(session.user.id);

  return (
    <>
      <DashboardPageHeader
        description="Persisted simulated trade history plus wallet and bonus event previews."
        title="Trade History"
      />

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <DashboardCard description="Manual and copied simulated trade executions" title="Trades">
          {state.kind === "ready" && state.rows.length > 0 ? (
            <DataTable
              columns={tradeColumns}
              getRowKey={(trade) => trade.id}
              minWidth="980px"
              rows={state.rows}
            />
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Open or close a simulated position in the terminal to create trade history."
              title="No trade history"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="Generate and apply the pending Drizzle migration before using persisted trade history."
              title="Trade history is not ready"
            />
          ) : null}
        </DashboardCard>

        <DashboardCard description="Wallet and bonus events" title="Account activity">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm" key={`${transaction.type}-${transaction.date}`}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{transaction.type}</p>
                  <p className="font-mono">{transaction.amount}</p>
                </div>
                <p className="mt-2 text-muted">{transaction.status} / {transaction.date}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}

async function getTradeHistory(userId: string): Promise<
  | { kind: "ready"; rows: TradeHistoryRow[] }
  | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(simulatedTrades)
      .where(eq(simulatedTrades.userId, userId))
      .orderBy(desc(simulatedTrades.executedAt));

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
