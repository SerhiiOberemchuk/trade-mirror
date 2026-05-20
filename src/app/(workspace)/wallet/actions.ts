"use server";

import { db } from "@/db";
import { bonusCampaignsSchema } from "@/db/schema/bonuses.schema";
import {
  depositRequestsSchema,
  withdrawalRiskLevelEnum,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const WALLET_PATH = "/wallet";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_DEPOSITS_PATH = "/admin/deposits";
const ADMIN_WITHDRAWALS_PATH = "/admin/withdrawals";
const ADMIN_BONUSES_PATH = "/admin/bonuses";
const MIN_DEPOSIT_CENTS = 1_000;
const MAX_DEPOSIT_CENTS = 100_000_00;
const MIN_WITHDRAWAL_CENTS = 1_000;
const MAX_WITHDRAWAL_CENTS = 100_000_00;
const MIN_BONUS_BASE_CENTS = 1_000;
const MAX_BONUS_BASE_CENTS = 100_000_00;
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
    paths: [WALLET_PATH, DASHBOARD_PATH, ADMIN_DEPOSITS_PATH],
    tags: [
      cacheTags.userWallet(session.user.id),
      cacheTags.userDashboard(session.user.id),
      CACHE_TAGS.adminDeposits,
    ],
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
    paths: [WALLET_PATH, DASHBOARD_PATH, ADMIN_WITHDRAWALS_PATH],
    tags: [
      cacheTags.userWallet(session.user.id),
      cacheTags.userDashboard(session.user.id),
      CACHE_TAGS.adminWithdrawals,
    ],
  });
}

export async function applyBonusCodeAction(formData: FormData) {
  const session = await requireSession();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const baseAmount = Number(formData.get("baseAmount"));

  if (!code) {
    throw new Error("Bonus code is required.");
  }

  if (!Number.isFinite(baseAmount)) {
    throw new Error("Bonus base amount is invalid.");
  }

  const baseAmountCents = Math.round(baseAmount * 100);

  if (
    baseAmountCents < MIN_BONUS_BASE_CENTS ||
    baseAmountCents > MAX_BONUS_BASE_CENTS
  ) {
    throw new Error("Bonus base amount must be between $10.00 and $100,000.00.");
  }

  const [campaign] = await db
    .select()
    .from(bonusCampaignsSchema)
    .where(eq(bonusCampaignsSchema.code, code))
    .limit(1);

  if (!campaign || campaign.status !== "enabled") {
    throw new Error("Bonus code is not available.");
  }

  const rewardCents =
    campaign.rewardType === "fixed"
      ? campaign.rewardValue
      : Math.round((baseAmountCents * campaign.rewardValue) / 100);

  if (rewardCents <= 0) {
    throw new Error("Bonus reward is invalid.");
  }

  await db.insert(depositRequestsSchema).values({
    amountCents: rewardCents,
    currency: "USD",
    method: `Bonus code ${campaign.code}`,
    status: "approved",
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  await db
    .update(bonusCampaignsSchema)
    .set({
      updatedAt: new Date(),
      usageCount: campaign.usageCount + 1,
    })
    .where(eq(bonusCampaignsSchema.id, campaign.id));

  invalidateAfterMutation({
    paths: [WALLET_PATH, DASHBOARD_PATH, ADMIN_DEPOSITS_PATH, ADMIN_BONUSES_PATH],
    tags: [
      cacheTags.userWallet(session.user.id),
      cacheTags.userDashboard(session.user.id),
      CACHE_TAGS.adminDeposits,
      CACHE_TAGS.adminBonuses,
    ],
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
