import { marketRows } from "@/data/marketing";
import { openPositions } from "@/data/dashboard";
import { TradingTerminalPreview } from "@/components/market-panels";
import {
  DataTable,
  DashboardCard,
  DashboardPageHeader,
  StatusBadge,
  type DataTableColumn,
} from "@/components/dashboard-shell";

type OpenPosition = (typeof openPositions)[number];

const openPositionColumns = [
  {
    header: "Pair",
    cell: (position) => <span className="font-medium">{position.pair}</span>,
  },
  {
    header: "Side",
    cell: (position) => <span className="text-muted">{position.side}</span>,
  },
  {
    header: "Size",
    cell: (position) => <span className="font-mono">{position.size}</span>,
  },
  {
    header: "Entry",
    cell: (position) => <span className="font-mono text-muted">{position.entry}</span>,
  },
  {
    header: "PnL",
    cell: (position) => (
      <span className={position.pnl.startsWith("+") ? "font-mono text-success" : "font-mono text-danger"}>
        {position.pnl}
      </span>
    ),
  },
] as const satisfies readonly DataTableColumn<OpenPosition>[];

export default function TerminalPage() {
  return (
    <>
      <DashboardPageHeader
        action={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950">
            New demo order
          </button>
        }
        description="Trading terminal layout for chart, order ticket, pair selector, and position monitoring."
        title="Trading Terminal"
      />

      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <TradingTerminalPreview />
        <DashboardCard description="Quick pair selection" title="Pairs">
          <div className="space-y-2">
            {marketRows.map((market) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-3 text-sm" key={market.pair}>
                <span className="font-medium">{market.pair}</span>
                <StatusBadge tone={market.change.startsWith("+") ? "success" : "danger"}>{market.change}</StatusBadge>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="mt-6">
        <DashboardCard description="Positions created by manual and copied demo orders" title="Open positions">
          <DataTable
            columns={openPositionColumns}
            getRowKey={(position) => position.pair}
            rows={openPositions}
          />
        </DashboardCard>
      </section>
    </>
  );
}
