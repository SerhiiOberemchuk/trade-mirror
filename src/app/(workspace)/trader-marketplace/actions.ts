"use server";

import { db } from "@/db";
import {
  copySettingsSchema,
  traderProfileRiskLevelEnum,
  traderProfilesSchema,
} from "@/db/schema/copy-trading.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const MARKETPLACE_PATH = "/trader-marketplace";
const COPY_TRADING_PATH = "/copy-trading";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_COPY_TRADING_PATH = "/admin/copy-trading";
const MIN_ALLOCATION_CENTS = 1_000;
const MAX_ALLOCATION_CENTS = 100_000_00;

type TraderRiskLevel = (typeof traderProfileRiskLevelEnum.enumValues)[number];

export type PublishTraderProfileState = ActionResult;

export async function publishTraderProfileAction(
  _state: PublishTraderProfileState,
  formData: FormData,
): Promise<PublishTraderProfileState> {
  const session = await requireSession();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const strategy = String(formData.get("strategy") ?? "").trim();
  const riskLevel = String(formData.get("riskLevel") ?? "medium");
  const monthlyPnl = Number(formData.get("monthlyPnl"));
  const winRate = Number(formData.get("winRate"));
  const maxDrawdown = Number(formData.get("maxDrawdown"));

  if (displayName.length < 3 || displayName.length > 80) {
    return errorState("Trader display name must be 3-80 characters.");
  }

  if (strategy.length < 3 || strategy.length > 120) {
    return errorState("Trader strategy must be 3-120 characters.");
  }

  if (!isRiskLevel(riskLevel)) {
    return errorState("Trader risk level is invalid.");
  }

  if (!isPercentMetric(monthlyPnl, -100, 300)) {
    return errorState("Monthly PnL must be between -100% and 300%.");
  }

  if (!isPercentMetric(winRate, 0, 100)) {
    return errorState("Win rate must be between 0% and 100%.");
  }

  if (!isPercentMetric(maxDrawdown, 0, 100)) {
    return errorState("Max drawdown must be between 0% and 100%.");
  }

  try {
    await db.insert(traderProfilesSchema).values({
      displayName,
      maxDrawdownBps: Math.round(maxDrawdown * 100),
      monthlyPnlBps: Math.round(monthlyPnl * 100),
      riskLevel,
      strategy,
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
      winRateBps: Math.round(winRate * 100),
    });

    revalidateCopyPaths(session.user.id);

    return actionSuccess("Trader profile published. It is now visible in the marketplace.");
  } catch {
    return errorState("Unable to publish this trader profile. Please try again.");
  }
}

export async function startCopyTradingAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const traderProfileId = String(formData.get("traderProfileId") ?? "");
  const allocation = Number(formData.get("allocation"));
  const copyRatio = Number(formData.get("copyRatio"));

  if (!traderProfileId) {
    return actionError("Trader profile is required.");
  }

  if (!Number.isFinite(allocation)) {
    return actionError("Copy allocation is invalid.");
  }

  const allocationCents = Math.round(allocation * 100);

  if (
    allocationCents < MIN_ALLOCATION_CENTS ||
    allocationCents > MAX_ALLOCATION_CENTS
  ) {
    return actionError("Copy allocation must be between $10.00 and $100,000.00.");
  }

  if (!isPercentMetric(copyRatio, 1, 100)) {
    return actionError("Copy ratio must be between 1% and 100%.");
  }

  try {
    const [profile] = await db
      .select()
      .from(traderProfilesSchema)
      .where(eq(traderProfilesSchema.id, traderProfileId))
      .limit(1);

    if (!profile || profile.status !== "published") {
      return actionError("Trader profile is not available for copying.");
    }

    await db.insert(copySettingsSchema).values({
      allocationCents,
      copyRatioBps: Math.round(copyRatio * 100),
      followerEmail: session.user.email,
      followerName: session.user.name,
      followerUserId: session.user.id,
      traderName: profile.displayName,
      traderProfileId: profile.id,
    });

    await db
      .update(traderProfilesSchema)
      .set({
        followersCount: profile.followersCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(traderProfilesSchema.id, profile.id));

    revalidateCopyPaths(session.user.id);

    return actionSuccess("Copy setting created.");
  } catch {
    return actionError("Unable to start copy trading. Please try again.");
  }
}

function isRiskLevel(riskLevel: string): riskLevel is TraderRiskLevel {
  return traderProfileRiskLevelEnum.enumValues.includes(
    riskLevel as TraderRiskLevel,
  );
}

function isPercentMetric(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function errorState(message: string): PublishTraderProfileState {
  return actionError(message);
}

function revalidateCopyPaths(userId: string) {
  invalidateAfterMutation({
    paths: [
      MARKETPLACE_PATH,
      COPY_TRADING_PATH,
      DASHBOARD_PATH,
      ADMIN_COPY_TRADING_PATH,
    ],
    tags: [
      CACHE_TAGS.traderMarketplace,
      CACHE_TAGS.adminCopyTrading,
      cacheTags.userCopyTrading(userId),
      cacheTags.userDashboard(userId),
    ],
  });
}
