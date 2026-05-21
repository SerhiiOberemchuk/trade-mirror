import { db } from "@/db";
import {
  depositRequestsSchema,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { and, desc, eq } from "drizzle-orm";

export type DepositRequestRow = {
  id: string;
  amount: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

export type WithdrawalRequestRow = {
  id: string;
  amount: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  date: string;
};

export type DepositRequestState =
  | { kind: "ready"; rows: DepositRequestRow[] }
  | { kind: "setup-required" };

export type WithdrawalRequestState =
  | { kind: "ready"; rows: WithdrawalRequestRow[] }
  | { kind: "setup-required" };

export async function getUserDepositRequests(
  userId: string,
): Promise<DepositRequestState> {
  try {
    const rows = await db
      .select()
      .from(depositRequestsSchema)
      .where(and(eq(depositRequestsSchema.userId, userId)))
      .orderBy(desc(depositRequestsSchema.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        amount: formatMoney(row.amountCents, row.currency),
        date: formatDate(row.requestedAt),
        id: row.id,
        method: row.method,
        status: row.status,
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

export async function getUserWithdrawalRequests(
  userId: string,
): Promise<WithdrawalRequestState> {
  try {
    const rows = await db
      .select()
      .from(withdrawalRequestsSchema)
      .where(and(eq(withdrawalRequestsSchema.userId, userId)))
      .orderBy(desc(withdrawalRequestsSchema.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        amount: formatMoney(row.amountCents, row.currency),
        date: formatDate(row.requestedAt),
        id: row.id,
        risk: row.riskLevel,
        status: row.status,
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
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
