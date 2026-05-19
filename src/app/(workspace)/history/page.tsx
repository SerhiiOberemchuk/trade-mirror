import { openPositions, transactions } from "@/data/dashboard";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function HistoryPage() {
  return (
    <>
      <DashboardPageHeader
        description="Combined preview of closed trades, wallet events, and copied trade history."
        title="Trade History"
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <DashboardCard description="Mock closed trade rows" title="Closed positions">
          <div className="space-y-3">
            {openPositions.map((position) => (
              <div className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm sm:grid-cols-5" key={position.pair}>
                <p className="font-medium">{position.pair}</p>
                <p className="text-muted">{position.side}</p>
                <p className="font-mono">{position.size}</p>
                <p className="font-mono text-muted">{position.entry}</p>
                <p className={position.pnl.startsWith("+") ? "font-mono text-success" : "font-mono text-danger"}>{position.pnl}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Wallet and bonus events" title="Account activity">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm" key={`${transaction.type}-${transaction.date}`}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{transaction.type}</p>
                  <p className="font-mono">{transaction.amount}</p>
                </div>
                <p className="mt-2 text-muted">{transaction.status} · {transaction.date}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}
