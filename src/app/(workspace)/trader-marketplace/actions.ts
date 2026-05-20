"use server";

import { db } from "@/db";
import { copySettings, traderProfiles } from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MARKETPLACE_PATH = "/trader-marketplace";
const COPY_TRADING_PATH = "/copy-trading";
const ADMIN_COPY_TRADING_PATH = "/admin/copy-trading";
const VALID_RISK_LEVELS = ["low", "medium", "high"] as const;
const MIN_ALLOCATION_CENTS = 1_000;
const MAX_ALLOCATION_CENTS = 100_000_00;

type TraderRiskLevel = (typeof VALID_RISK_LEVELS)[number];

export async function publishTraderProfileAction(formData: FormData) {
  const session = await requireSession();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const strategy = String(formData.get("strategy") ?? "").trim();
  const riskLevel = String(formData.get("riskLevel") ?? "medium");
  const monthlyPnl = Number(formData.get("monthlyPnl"));
  const winRate = Number(formData.get("winRate"));
  const maxDrawdown = Number(formData.get("maxDrawdown"));

  if (displayName.length < 3 || displayName.length > 80) {
    throw new Error("Trader display name must be 3-80 characters.");
  }

  if (strategy.length < 3 || strategy.length > 120) {
    throw new Error("Trader strategy must be 3-120 characters.");
  }

  if (!isRiskLevel(riskLevel)) {
    throw new Error("Trader risk level is invalid.");
  }

  if (!isPercentMetric(monthlyPnl, -100, 300)) {
    throw new Error("Monthly PnL must be between -100% and 300%.");
  }

  if (!isPercentMetric(winRate, 0, 100)) {
    throw new Error("Win rate must be between 0% and 100%.");
  }

  if (!isPercentMetric(maxDrawdown, 0, 100)) {
    throw new Error("Max drawdown must be between 0% and 100%.");
  }

  await db.insert(traderProfiles).values({
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

  revalidateCopyPaths();
}

export async function startCopyTradingAction(formData: FormData) {
  const session = await requireSession();
  const traderProfileId = String(formData.get("traderProfileId") ?? "");
  const allocation = Number(formData.get("allocation"));
  const copyRatio = Number(formData.get("copyRatio"));

  if (!traderProfileId) {
    throw new Error("Trader profile is required.");
  }

  if (!Number.isFinite(allocation)) {
    throw new Error("Copy allocation is invalid.");
  }

  const allocationCents = Math.round(allocation * 100);

  if (allocationCents < MIN_ALLOCATION_CENTS || allocationCents > MAX_ALLOCATION_CENTS) {
    throw new Error("Copy allocation must be between $10.00 and $100,000.00.");
  }

  if (!isPercentMetric(copyRatio, 1, 100)) {
    throw new Error("Copy ratio must be between 1% and 100%.");
  }

  const [profile] = await db
    .select()
    .from(traderProfiles)
    .where(eq(traderProfiles.id, traderProfileId))
    .limit(1);

  if (!profile || profile.status !== "published") {
    throw new Error("Trader profile is not available for copying.");
  }

  await db.insert(copySettings).values({
    allocationCents,
    copyRatioBps: Math.round(copyRatio * 100),
    followerEmail: session.user.email,
    followerName: session.user.name,
    followerUserId: session.user.id,
    traderName: profile.displayName,
    traderProfileId: profile.id,
  });

  await db
    .update(traderProfiles)
    .set({
      followersCount: profile.followersCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(traderProfiles.id, profile.id));

  revalidateCopyPaths();
}

function isRiskLevel(riskLevel: string): riskLevel is TraderRiskLevel {
  return VALID_RISK_LEVELS.includes(riskLevel as TraderRiskLevel);
}

function isPercentMetric(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function revalidateCopyPaths() {
  revalidatePath(MARKETPLACE_PATH);
  revalidatePath(COPY_TRADING_PATH);
  revalidatePath(ADMIN_COPY_TRADING_PATH);
}
