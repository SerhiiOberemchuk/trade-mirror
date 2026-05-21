"use server";

import { db } from "@/db";
import { referralProfilesSchema } from "@/db/schema/referrals.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";
import { user } from "../../../../../auth-schema";

const ADMIN_REFERRALS_PATH = "/admin/referrals";
const MIN_REWARD_CENTS = 0;
const MAX_REWARD_CENTS = 100_000_00;

export async function createReferralProfileAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();

  const referrerEmail = String(formData.get("referrerEmail") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const reward = Number(formData.get("reward"));

  if (!isValidEmail(referrerEmail)) {
    return actionError("Referrer email is invalid.");
  }

  if (!/^[A-Z0-9-]{4,32}$/.test(code)) {
    return actionError("Referral code must be 4-32 characters and use A-Z, 0-9, or hyphen.");
  }

  if (!Number.isFinite(reward)) {
    return actionError("Referral reward is invalid.");
  }

  const rewardCents = Math.round(reward * 100);

  if (rewardCents < MIN_REWARD_CENTS || rewardCents > MAX_REWARD_CENTS) {
    return actionError("Referral reward must be between $0.00 and $100,000.00.");
  }

  try {
    const [referrer] = await db
      .select()
      .from(user)
      .where(eq(user.email, referrerEmail))
      .limit(1);

    if (!referrer) {
      return actionError("Referrer user was not found.");
    }

    await db.insert(referralProfilesSchema).values({
      code,
      referrerEmail: referrer.email,
      referrerName: referrer.name,
      referrerUserId: referrer.id,
      rewardCents,
    });

    revalidateReferralAdmin();

    return actionSuccess("Referral profile created.");
  } catch {
    return actionError("Unable to create this referral profile. Please try again.");
  }
}

export async function activateReferralProfileAction(formData: FormData): Promise<ActionResult> {
  return updateReferralProfileStatus(formData, "active");
}

export async function pauseReferralProfileAction(formData: FormData): Promise<ActionResult> {
  return updateReferralProfileStatus(formData, "paused");
}

async function updateReferralProfileStatus(
  formData: FormData,
  status: (typeof referralProfilesSchema.$inferSelect)["status"],
): Promise<ActionResult> {
  await requireAdminSession();

  const profileId = String(formData.get("profileId") ?? "");

  if (!profileId) {
    return actionError("Referral profile request is invalid.");
  }

  try {
    await db
      .update(referralProfilesSchema)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(referralProfilesSchema.id, profileId));

    revalidateReferralAdmin();

    return actionSuccess("Referral profile updated.");
  } catch {
    return actionError("Unable to update this referral profile. Please try again.");
  }
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
