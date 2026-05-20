import { adminTrades } from "@/data/admin";
import {
  AdminCard,
  AdminPageHeader,
  DataTable,
  type DataTableColumn,
} from "@/components/admin-shell";

type AdminTrade = (typeof adminTrades)[number];

const tradeColumns = [
  {
    header: "ID",
    cell: (trade) => <span className="font-mono text-muted">{trade.id}</span>,
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
    cell: (trade) => <span className="text-muted">{trade.side}</span>,
  },
  {
    header: "Size",
    cell: (trade) => <span className="font-mono">{trade.size}</span>,
  },
  {
    header: "PnL",
    cell: (trade) => (
      <span className={trade.pnl.startsWith("+") ? "font-mono text-success" : "font-mono text-danger"}>
        {trade.pnl}
      </span>
    ),
  },
] as const satisfies readonly DataTableColumn<AdminTrade>[];

export default function AdminTradesPage() {
  return (
    <>
      <AdminPageHeader
        description="Platform-level trade monitor for simulated manual and copied positions."
        title="Trades History"
      />

      <AdminCard description="Recent trade activity" title="Trades">
        <DataTable
          columns={tradeColumns}
          getRowKey={(trade) => trade.id}
          rows={adminTrades}
        />
      </AdminCard>
    </>
  );
}
