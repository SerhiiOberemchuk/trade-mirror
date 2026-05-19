import { transactions, walletBalances } from "@/data/dashboard";
import { DashboardCard, DashboardPageHeader, StatTile } from "@/components/dashboard-shell";

export default function WalletPage() {
  return (
    <>
      <DashboardPageHeader
        action={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950">
            Demo deposit
          </button>
        }
        description="Simulated wallet overview for balances, locked funds, deposit previews, and withdrawal review states."
        title="Wallet"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {walletBalances.map((balance) => (
          <StatTile key={balance.label} label={balance.label} value={balance.value} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardCard description="Mock request controls" title="Funds simulation">
          <div className="space-y-3">
            {["Deposit simulation", "Withdrawal request", "Bonus activation"].map((item) => (
              <button className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm" key={item}>
                {item}
              </button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Recent wallet-related events" title="Transactions">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm sm:grid-cols-4" key={`${transaction.type}-${transaction.date}`}>
                <p className="font-medium">{transaction.type}</p>
                <p className="font-mono">{transaction.amount}</p>
                <p className="text-muted">{transaction.status}</p>
                <p className="text-muted sm:text-right">{transaction.date}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}
