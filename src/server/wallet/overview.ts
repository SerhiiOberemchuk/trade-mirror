import { db } from "@/db";
import { simulatedPositionsSchema } from "@/db/schema/trading.schema";
import {
  depositRequestsSchema,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { desc, eq } from "drizzle-orm";

export type WalletBalanceTile = {
  label: string;
  value: string;
};

export type WalletTransactionRow = {
  id: string;
  type: string;
  amount: string;
  status: string;
  date: string;
};

export type WalletOverviewState = {
  balances: WalletBalanceTile[];
  transactions: WalletTransactionRow[];
};

type WalletTransactionRecord = WalletTransactionRow & {
  requestedAt: Date;
};

export async function getWalletOverviewState(userId: string): Promise<WalletOverviewState> {
  const [deposits, withdrawals, positions] = await Promise.all([
    db
      .select()
      .from(depositRequestsSchema)
      .where(eq(depositRequestsSchema.userId, userId))
      .orderBy(desc(depositRequestsSchema.requestedAt)),
    db
      .select()
      .from(withdrawalRequestsSchema)
      .where(eq(withdrawalRequestsSchema.userId, userId))
      .orderBy(desc(withdrawalRequestsSchema.requestedAt)),
    db
      .select()
      .from(simulatedPositionsSchema)
      .where(eq(simulatedPositionsSchema.userId, userId)),
  ]);

  const approvedDeposits = deposits.filter((deposit) => deposit.status === "approved");
  const approvedWithdrawals = withdrawals.filter((withdrawal) => withdrawal.status === "approved");
  const openPositions = positions.filter((position) => position.status === "open");
  const closedPositions = positions.filter((position) => position.status === "closed");
  const approvedDepositCents = sumCents(approvedDeposits, (deposit) => deposit.amountCents);
  const approvedWithdrawalCents = sumCents(approvedWithdrawals, (withdrawal) => withdrawal.amountCents);
  const realizedPnlCents = sumCents(
    closedPositions,
    (position) => position.realizedPnlCents ?? 0,
  );
  const demoBalanceCents = approvedDepositCents - approvedWithdrawalCents + realizedPnlCents;
  const lockedMarginCents = sumCents(openPositions, (position) => position.notionalCents);
  const pendingReviewCents =
    sumCents(
      deposits.filter((deposit) => deposit.status === "pending"),
      (deposit) => deposit.amountCents,
    ) +
    sumCents(
      withdrawals.filter((withdrawal) => withdrawal.status === "pending"),
      (withdrawal) => withdrawal.amountCents,
    );

  return {
    balances: [
      { label: "Demo balance", value: formatMoney(demoBalanceCents) },
      {
        label: "Bonus balance",
        value: formatMoney(
          sumCents(
            approvedDeposits.filter((deposit) => deposit.method.startsWith("Bonus code")),
            (deposit) => deposit.amountCents,
          ),
        ),
      },
      { label: "Locked margin", value: formatMoney(lockedMarginCents) },
      { label: "Pending review", value: formatMoney(pendingReviewCents) },
    ],
    transactions: getWalletTransactions(deposits, withdrawals),
  };
}

function getWalletTransactions(
  deposits: (typeof depositRequestsSchema.$inferSelect)[],
  withdrawals: (typeof withdrawalRequestsSchema.$inferSelect)[],
) {
  const records = [
    ...deposits.map((deposit) => ({
      amount: `+${formatMoney(deposit.amountCents)}`,
      date: formatDate(deposit.requestedAt),
      id: `deposit-${deposit.id}`,
      requestedAt: deposit.requestedAt,
      status: formatStatus(deposit.status),
      type: deposit.method.startsWith("Bonus code") ? "Bonus credit" : "Demo deposit",
    })),
    ...withdrawals.map((withdrawal) => ({
      amount: `-${formatMoney(withdrawal.amountCents)}`,
      date: formatDate(withdrawal.requestedAt),
      id: `withdrawal-${withdrawal.id}`,
      requestedAt: withdrawal.requestedAt,
      status: formatStatus(withdrawal.status),
      type: "Withdrawal request",
    })),
  ] satisfies WalletTransactionRecord[];

  return records
    .sort((left, right) => Number(right.requestedAt) - Number(left.requestedAt))
    .slice(0, 6)
    .map(toWalletTransactionRow);
}

function sumCents<Row>(rows: readonly Row[], selector: (row: Row) => number) {
  return rows.reduce((total, row) => total + selector(row), 0);
}

function toWalletTransactionRow(record: WalletTransactionRecord): WalletTransactionRow {
  return {
    amount: record.amount,
    date: record.date,
    id: record.id,
    status: record.status,
    type: record.type,
  };
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
