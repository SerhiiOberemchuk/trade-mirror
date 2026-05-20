import { db } from "@/db";
import {
  depositRequestsSchema,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { transactions, walletBalances } from "@/data/dashboard";
import { requireSession } from "@/server/auth/session";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
  StatTile,
} from "@/components/dashboard-shell";
import { and, desc, eq } from "drizzle-orm";
import {
  createDepositRequestAction,
  createWithdrawalRequestAction,
} from "./actions";

type DepositRequestRow = {
  id: string;
  amount: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

type WithdrawalRequestRow = {
  id: string;
  amount: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  date: string;
};

export default async function WalletPage() {
  const session = await requireSession();
  const depositState = await getUserDepositRequests(session.user.id);
  const withdrawalState = await getUserWithdrawalRequests(session.user.id);

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
          <StatTile
            key={balance.label}
            label={balance.label}
            value={balance.value}
          />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.8fr_0.8fr_1.2fr]">
        <DashboardCard
          description="Create a simulated deposit request for admin review"
          title="Deposit request"
        >
          <form action={createDepositRequestAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Amount</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="5000"
                max="100000"
                min="10"
                name="amount"
                step="0.01"
                type="number"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Method</span>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="demo-card"
                name="method"
              >
                <option value="demo-card">Demo card</option>
                <option value="demo-wire">Demo wire</option>
                <option value="bonus-credit">Bonus credit</option>
              </select>
            </label>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Submit deposit request
            </button>
          </form>
        </DashboardCard>

        <DashboardCard
          description="Create a simulated withdrawal request for admin review"
          title="Withdrawal request"
        >
          <form action={createWithdrawalRequestAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Amount</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="2500"
                max="100000"
                min="10"
                name="amount"
                step="0.01"
                type="number"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Review risk</span>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="low"
                name="riskLevel"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Submit withdrawal request
            </button>
          </form>
        </DashboardCard>

        <DashboardCard
          description="Recent wallet-related events"
          title="Transactions"
        >
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm sm:grid-cols-4"
                key={`${transaction.type}-${transaction.date}`}
              >
                <p className="font-medium">{transaction.type}</p>
                <p className="font-mono">{transaction.amount}</p>
                <p className="text-muted">{transaction.status}</p>
                <p className="text-muted sm:text-right">{transaction.date}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <DashboardCard
          description="Your persisted simulated deposit requests"
          title="Deposit review queue"
        >
          {depositState.kind === "ready" && depositState.rows.length > 0 ? (
            <div className="space-y-3">
              {depositState.rows.map((request) => (
                <div
                  className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[1fr_120px_120px_140px]"
                  key={request.id}
                >
                  <p className="font-mono">{request.amount}</p>
                  <p className="text-muted">{request.method}</p>
                  <StatusBadge tone={getStatusTone(request.status)}>
                    {request.status}
                  </StatusBadge>
                  <p className="text-muted md:text-right">{request.date}</p>
                </div>
              ))}
            </div>
          ) : null}

          {depositState.kind === "ready" && depositState.rows.length === 0 ? (
            <EmptyState
              description="Submit a request above and it will appear in the admin deposit queue."
              title="No deposit requests yet"
            />
          ) : null}

          {depositState.kind === "setup-required" ? (
            <EmptyState
              description="The deposit table is not available yet. Apply the generated Drizzle migration before creating requests."
              title="Deposit requests are not ready"
            />
          ) : null}
        </DashboardCard>

        <DashboardCard
          description="Your persisted simulated withdrawal requests"
          title="Withdrawal review queue"
        >
          {withdrawalState.kind === "ready" &&
          withdrawalState.rows.length > 0 ? (
            <div className="space-y-3">
              {withdrawalState.rows.map((request) => (
                <div
                  className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[1fr_120px_120px_140px]"
                  key={request.id}
                >
                  <p className="font-mono">{request.amount}</p>
                  <StatusBadge tone={getRiskTone(request.risk)}>
                    {request.risk}
                  </StatusBadge>
                  <StatusBadge tone={getStatusTone(request.status)}>
                    {request.status}
                  </StatusBadge>
                  <p className="text-muted md:text-right">{request.date}</p>
                </div>
              ))}
            </div>
          ) : null}

          {withdrawalState.kind === "ready" &&
          withdrawalState.rows.length === 0 ? (
            <EmptyState
              description="Submit a request above and it will appear in the admin withdrawal queue."
              title="No withdrawal requests yet"
            />
          ) : null}

          {withdrawalState.kind === "setup-required" ? (
            <EmptyState
              description="The withdrawal table is not available yet. Apply the generated Drizzle migration before creating requests."
              title="Withdrawal requests are not ready"
            />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

async function getUserDepositRequests(
  userId: string,
): Promise<
  { kind: "ready"; rows: DepositRequestRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(depositRequestsSchema)
      .where(and(eq(depositRequestsSchema.userId, userId)))
      .orderBy(desc(depositRequestsSchema.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        amount: formatMoney(row.amountCents, row.currency),
        method: row.method,
        status: row.status,
        date: formatDate(row.requestedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

async function getUserWithdrawalRequests(
  userId: string,
): Promise<
  { kind: "ready"; rows: WithdrawalRequestRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(withdrawalRequestsSchema)
      .where(and(eq(withdrawalRequestsSchema.userId, userId)))
      .orderBy(desc(withdrawalRequestsSchema.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        amount: formatMoney(row.amountCents, row.currency),
        risk: row.riskLevel,
        status: row.status,
        date: formatDate(row.requestedAt),
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRiskTone(risk: WithdrawalRequestRow["risk"]) {
  if (risk === "high") {
    return "danger";
  }

  if (risk === "medium") {
    return "warning";
  }

  return "success";
}

function getStatusTone(status: WithdrawalRequestRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
