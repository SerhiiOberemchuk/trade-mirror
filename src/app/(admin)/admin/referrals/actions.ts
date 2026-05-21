"use server";

import { db } from "@/db";
import { referralProfilesSchema } from "@/db/schema/referrals.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";
import { user } from "../../../../../auth-schema";

const ADMIN_REFERRALS_PATH = "/admin/referrals";
const MIN_REWARD_CENTS = 0;
const MAX_REWARD_CENTS = 100_000_00;

export async function createReferralProfileAction(formData: FormData) {
  await requireAdminSession();

  const referrerEmail = String(formData.get("referrerEmail") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const reward = Number(formData.get("reward"));

  if (!isValidEmail(referrerEmail)) {
    throw new Error("Referrer email is invalid.");
  }

  if (!/^[A-Z0-9-]{4,32}$/.test(code)) {
    throw new Error("Referral code must be 4-32 characters and use A-Z, 0-9, or hyphen.");
  }

  if (!Number.isFinite(reward)) {
    throw new Error("Referral reward is invalid.");
  }

  const rewardCents = Math.round(reward * 100);

  if (rewardCents < MIN_REWARD_CENTS || rewardCents > MAX_REWARD_CENTS) {
    throw new Error("Referral reward must be between $0.00 and $100,000.00.");
  }

  const [referrer] = await db
    .select()
    .from(user)
    .where(eq(user.email, referrerEmail))
    .limit(1);

  if (!referrer) {
    throw new Error("Referrer user was not found.");
  }

  await db.insert(referralProfilesSchema).values({
    code,
    referrerEmail: referrer.email,
    referrerName: referrer.name,
    referrerUserId: referrer.id,
    rewardCents,
  });

  revalidateReferralAdmin();
}

export async function activateReferralProfileAction(formData: FormData) {
  await updateReferralProfileStatus(formData, "active");
}

export async function pauseReferralProfileAction(formData: FormData) {
  await updateReferralProfileStatus(formData, "paused");
}

async function updateReferralProfileStatus(
  formData: FormData,
  status: (typeof referralProfilesSchema.$inferSelect)["status"],
) {
  await requireAdminSession();

  const profileId = String(formData.get("profileId") ?? "");

  if (!profileId) {
    throw new Error("Referral profile request is invalid.");
  }

  await db
    .update(referralProfilesSchema)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(referralProfilesSchema.id, profileId));

  revalidateReferralAdmin();
}

function revalidateReferralAdmin() {
  invalidateAfterMutation({
    paths: [ADMIN_REFERRALS_PATH],
    tags: [CACHE_TAGS.adminReferrals],
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
