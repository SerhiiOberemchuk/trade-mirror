"use server";

import { db } from "@/db";
import { bonusCampaignsSchema, bonusRewardTypeEnum } from "@/db/schema/bonuses.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const ADMIN_BONUSES_PATH = "/admin/bonuses";
const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

type BonusRewardType = (typeof bonusRewardTypeEnum.enumValues)[number];

export async function createBonusCampaignAction(formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const rewardType = String(formData.get("rewardType") ?? "percent");
  const rewardValue = Number(formData.get("rewardValue"));

  if (name.length < 3 || name.length > 120) {
    throw new Error("Bonus campaign name must be 3-120 characters.");
  }

  if (!CODE_PATTERN.test(code)) {
    throw new Error(
      "Bonus code must be 3-32 uppercase letters, numbers, underscores, or hyphens.",
    );
  }

  if (!isBonusRewardType(rewardType)) {
    throw new Error("Bonus reward type is invalid.");
  }

  if (!Number.isFinite(rewardValue) || rewardValue <= 0) {
    throw new Error("Bonus reward value is invalid.");
  }

  const normalizedRewardValue =
    rewardType === "fixed"
      ? Math.round(rewardValue * 100)
      : Math.round(rewardValue);

  if (rewardType === "percent" && normalizedRewardValue > 100) {
    throw new Error("Percent bonus cannot be greater than 100.");
  }

  if (rewardType === "fixed" && normalizedRewardValue > 100_000_00) {
    throw new Error("Fixed bonus cannot be greater than $100,000.00.");
  }

  await db.insert(bonusCampaignsSchema).values({
    code,
    name,
    rewardType,
    rewardValue: normalizedRewardValue,
  });

  revalidateBonuses();
}

export async function enableBonusCampaignAction(formData: FormData) {
  await updateBonusCampaignStatus(formData, "enabled");
}

export async function pauseBonusCampaignAction(formData: FormData) {
  await updateBonusCampaignStatus(formData, "paused");
}

async function updateBonusCampaignStatus(
  formData: FormData,
  status: "enabled" | "paused",
) {
  await requireAdminSession();
  const campaignId = String(formData.get("campaignId") ?? "");

  if (!campaignId) {
    throw new Error("Invalid bonus campaign request.");
  }

  await db
    .update(bonusCampaignsSchema)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(bonusCampaignsSchema.id, campaignId));

  revalidateBonuses();
}

function isBonusRewardType(rewardType: string): rewardType is BonusRewardType {
  return bonusRewardTypeEnum.enumValues.includes(
    rewardType as BonusRewardType,
  );
}

function revalidateBonuses() {
  invalidateAfterMutation({
    paths: [ADMIN_BONUSES_PATH],
    tags: [CACHE_TAGS.adminBonuses],
  });
}
