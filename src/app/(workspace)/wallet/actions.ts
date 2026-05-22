"use server";

import { db } from "@/db";
import { bonusCampaignsSchema } from "@/db/schema/bonuses.schema";
import {
  depositRequestsSchema,
  withdrawalRiskLevelEnum,
  withdrawalRequestsSchema,
} from "@/db/schema/wallet.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { createAdminNotification, createUserNotification } from "@/server/notifications/notifications";
import { eq } from "drizzle-orm";

const WALLET_PATH = "/wallet";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_DEPOSITS_PATH = "/admin/deposits";
const ADMIN_WITHDRAWALS_PATH = "/admin/withdrawals";
const ADMIN_BONUSES_PATH = "/admin/bonuses";
const ADMIN_NOTIFICATIONS_PATH = "/admin/notifications";
const NOTIFICATIONS_PATH = "/notifications";
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

export type WalletActionState = ActionResult;

export async function createDepositRequestAction(
  _state: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> {
  const session = await requireSession();
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "demo-card");

  if (!Number.isFinite(amount)) {
    return actionError("Deposit amount is invalid.");
  }

  const amountCents = Math.round(amount * 100);

  if (amountCents < MIN_DEPOSIT_CENTS || amountCents > MAX_DEPOSIT_CENTS) {
    return actionError("Deposit amount must be between $10.00 and $100,000.00.");
  }

  if (!isDepositMethod(method)) {
    return actionError("Deposit method is invalid.");
  }

  try {
    await db.insert(depositRequestsSchema).values({
      amountCents,
      currency: "USD",
      method: DEPOSIT_METHOD_LABELS[method],
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    });

    await createAdminNotification({
      body: `${session.user.name} submitted a simulated deposit request for ${formatMoney(amountCents)}.`,
      href: ADMIN_DEPOSITS_PATH,
      title: "New deposit request",
      type: "deposit",
    });

    invalidateWalletDeposit(session.user.id);

    return actionSuccess("Deposit request submitted for admin review.");
  } catch {
    return actionError("Unable to create this deposit request. Please try again.");
  }
}

export async function createWithdrawalRequestAction(
  _state: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> {
  const session = await requireSession();
  const amount = Number(formData.get("amount"));
  const riskLevel = String(formData.get("riskLevel") ?? "low");

  if (!Number.isFinite(amount)) {
    return actionError("Withdrawal amount is invalid.");
  }

  const amountCents = Math.round(amount * 100);

  if (
    amountCents < MIN_WITHDRAWAL_CENTS ||
    amountCents > MAX_WITHDRAWAL_CENTS
  ) {
    return actionError("Withdrawal amount must be between $10.00 and $100,000.00.");
  }

  if (!isWithdrawalRiskLevel(riskLevel)) {
    return actionError("Withdrawal risk level is invalid.");
  }

  try {
    await db.insert(withdrawalRequestsSchema).values({
      amountCents,
      currency: "USD",
      riskLevel,
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    });

    await createAdminNotification({
      body: `${session.user.name} submitted a simulated withdrawal request for ${formatMoney(amountCents)}.`,
      href: ADMIN_WITHDRAWALS_PATH,
      title: "New withdrawal request",
      type: "withdrawal",
    });

    invalidateWalletWithdrawal(session.user.id);

    return actionSuccess("Withdrawal request submitted for admin review.");
  } catch {
    return actionError("Unable to create this withdrawal request. Please try again.");
  }
}

export async function applyBonusCodeAction(
  _state: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> {
  const session = await requireSession();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const baseAmount = Number(formData.get("baseAmount"));

  if (!code) {
    return actionError("Bonus code is required.");
  }

  if (!Number.isFinite(baseAmount)) {
    return actionError("Bonus base amount is invalid.");
  }

  const baseAmountCents = Math.round(baseAmount * 100);

  if (
    baseAmountCents < MIN_BONUS_BASE_CENTS ||
    baseAmountCents > MAX_BONUS_BASE_CENTS
  ) {
    return actionError("Bonus base amount must be between $10.00 and $100,000.00.");
  }

  const [campaign] = await db
    .select()
    .from(bonusCampaignsSchema)
    .where(eq(bonusCampaignsSchema.code, code))
    .limit(1);

  if (!campaign || campaign.status !== "enabled") {
    return actionError("Bonus code is not available.");
  }

  const rewardCents =
    campaign.rewardType === "fixed"
      ? campaign.rewardValue
      : Math.round((baseAmountCents * campaign.rewardValue) / 100);

  if (rewardCents <= 0) {
    return actionError("Bonus reward is invalid.");
  }

  try {
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

    await createUserNotification({
      body: `${campaign.code} added ${formatMoney(rewardCents)} as approved simulated credit.`,
      href: WALLET_PATH,
      title: "Bonus applied",
      type: "deposit",
      userId: session.user.id,
    });

    invalidateWalletBonus(session.user.id);

    return actionSuccess("Bonus applied as approved simulated credit.");
  } catch {
    return actionError("Unable to apply this bonus code. Please try again.");
  }
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
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

function invalidateWalletDeposit(userId: string) {
  invalidateAfterMutation({
    paths: [WALLET_PATH, DASHBOARD_PATH, ADMIN_DEPOSITS_PATH, ADMIN_NOTIFICATIONS_PATH],
    tags: [
      cacheTags.userWallet(userId),
      cacheTags.userDashboard(userId),
      CACHE_TAGS.adminDeposits,
      CACHE_TAGS.adminNotifications,
    ],
  });
}

function invalidateWalletWithdrawal(userId: string) {
  invalidateAfterMutation({
    paths: [WALLET_PATH, DASHBOARD_PATH, ADMIN_WITHDRAWALS_PATH, ADMIN_NOTIFICATIONS_PATH],
    tags: [
      cacheTags.userWallet(userId),
      cacheTags.userDashboard(userId),
      CACHE_TAGS.adminWithdrawals,
      CACHE_TAGS.adminNotifications,
    ],
  });
}

function invalidateWalletBonus(userId: string) {
  invalidateAfterMutation({
    paths: [WALLET_PATH, DASHBOARD_PATH, NOTIFICATIONS_PATH, ADMIN_DEPOSITS_PATH, ADMIN_BONUSES_PATH],
    tags: [
      cacheTags.userWallet(userId),
      cacheTags.userDashboard(userId),
      cacheTags.userNotifications(userId),
      CACHE_TAGS.adminDeposits,
      CACHE_TAGS.adminBonuses,
    ],
  });
}
