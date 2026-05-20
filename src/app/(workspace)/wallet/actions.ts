"use server";

import { db } from "@/db";
import {
  depositRequestsSchema,
  withdrawalRiskLevelEnum,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";

const WALLET_PATH = "/wallet";
const ADMIN_DEPOSITS_PATH = "/admin/deposits";
const ADMIN_WITHDRAWALS_PATH = "/admin/withdrawals";
const MIN_DEPOSIT_CENTS = 1_000;
const MAX_DEPOSIT_CENTS = 100_000_00;
const MIN_WITHDRAWAL_CENTS = 1_000;
const MAX_WITHDRAWAL_CENTS = 100_000_00;
const DEPOSIT_METHOD_LABELS = {
  "bonus-credit": "Bonus credit",
  "demo-card": "Demo card",
  "demo-wire": "Demo wire",
} as const;

type DepositMethod = keyof typeof DEPOSIT_METHOD_LABELS;
type WithdrawalRiskLevel = (typeof withdrawalRiskLevelEnum.enumValues)[number];

export async function createDepositRequestAction(formData: FormData) {
  const session = await requireSession();
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "demo-card");

  if (!Number.isFinite(amount)) {
    throw new Error("Deposit amount is invalid.");
  }

  const amountCents = Math.round(amount * 100);

  if (amountCents < MIN_DEPOSIT_CENTS || amountCents > MAX_DEPOSIT_CENTS) {
    throw new Error("Deposit amount must be between $10.00 and $100,000.00.");
  }

  if (!isDepositMethod(method)) {
    throw new Error("Deposit method is invalid.");
  }

  await db.insert(depositRequestsSchema).values({
    amountCents,
    currency: "USD",
    method: DEPOSIT_METHOD_LABELS[method],
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  invalidateAfterMutation({
    paths: [WALLET_PATH, ADMIN_DEPOSITS_PATH],
    tags: [cacheTags.userWallet(session.user.id), CACHE_TAGS.adminDeposits],
  });
}

export async function createWithdrawalRequestAction(formData: FormData) {
  const session = await requireSession();
  const amount = Number(formData.get("amount"));
  const riskLevel = String(formData.get("riskLevel") ?? "low");

  if (!Number.isFinite(amount)) {
    throw new Error("Withdrawal amount is invalid.");
  }

  const amountCents = Math.round(amount * 100);

  if (
    amountCents < MIN_WITHDRAWAL_CENTS ||
    amountCents > MAX_WITHDRAWAL_CENTS
  ) {
    throw new Error(
      "Withdrawal amount must be between $10.00 and $100,000.00.",
    );
  }

  if (!isWithdrawalRiskLevel(riskLevel)) {
    throw new Error("Withdrawal risk level is invalid.");
  }

  await db.insert(withdrawalRequestsSchema).values({
    amountCents,
    currency: "USD",
    riskLevel,
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  invalidateAfterMutation({
    paths: [WALLET_PATH, ADMIN_WITHDRAWALS_PATH],
    tags: [cacheTags.userWallet(session.user.id), CACHE_TAGS.adminWithdrawals],
  });
}

function isDepositMethod(method: string): method is DepositMethod {
  return method in DEPOSIT_METHOD_LABELS;
}

function isWithdrawalRiskLevel(
  riskLevel: string,
): riskLevel is WithdrawalRiskLevel {
  return withdrawalRiskLevelEnum.enumValues.includes(
    riskLevel as WithdrawalRiskLevel,
  );
}
