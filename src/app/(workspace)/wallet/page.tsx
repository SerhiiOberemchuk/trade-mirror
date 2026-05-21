import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatTile,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { getWalletOverviewState } from "@/server/wallet/overview";
import {
  getUserDepositRequests,
  getUserWithdrawalRequests,
} from "@/server/wallet/requests";
import { WalletForms } from "./forms";
import { WalletRequestQueues } from "./request-queues";

export default async function WalletPage() {
  const session = await requireSession();
  const [overview, depositState, withdrawalState] = await Promise.all([
    getWalletOverviewState(session.user.id),
    getUserDepositRequests(session.user.id),
    getUserWithdrawalRequests(session.user.id),
  ]);

  return (
    <>
      <DashboardPageHeader
        description="Simulated wallet overview for balances, locked funds, deposit requests, bonus credits, and withdrawal review states."
        title="Wallet"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.balances.map((balance) => (
          <StatTile
            key={balance.label}
            label={balance.label}
            value={balance.value}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-4">
        <WalletForms />
        <WalletTransactions transactions={overview.transactions} />
      </section>

      <WalletRequestQueues
        depositState={depositState}
        withdrawalState={withdrawalState}
      />
    </>
  );
}

function WalletTransactions({
  transactions,
}: {
  transactions: Awaited<ReturnType<typeof getWalletOverviewState>>["transactions"];
}) {
  return (
    <DashboardCard
      description="Recent wallet-related events"
      title="Transactions"
    >
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm sm:grid-cols-4"
            key={transaction.id}
          >
            <p className="font-medium">{transaction.type}</p>
            <p className="font-mono">{transaction.amount}</p>
            <p className="text-muted">{transaction.status}</p>
            <p className="text-muted sm:text-right">{transaction.date}</p>
          </div>
        ))}
        {transactions.length === 0 ? (
          <EmptyState
            description="Deposit, withdrawal, and bonus events will appear here."
            title="No wallet transactions"
          />
        ) : null}
      </div>
    </DashboardCard>
  );
}
