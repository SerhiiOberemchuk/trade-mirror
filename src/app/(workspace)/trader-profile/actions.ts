"use server";

import { db } from "@/db";
import { traderProfilesSchema } from "@/db/schema/copy-trading.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { and, eq } from "drizzle-orm";

const TRADER_PROFILE_PATH = "/trader-profile";
const MARKETPLACE_PATH = "/trader-marketplace";
const COPY_TRADING_PATH = "/copy-trading";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_COPY_TRADING_PATH = "/admin/copy-trading";

export async function pauseTraderProfileAction(formData: FormData) {
  await updateOwnTraderProfileStatus(formData, "paused");
}

export async function publishOwnTraderProfileAction(formData: FormData) {
  await updateOwnTraderProfileStatus(formData, "published");
}

async function updateOwnTraderProfileStatus(
  formData: FormData,
  status: (typeof traderProfilesSchema.$inferSelect)["status"],
) {
  const session = await requireSession();
  const profileId = String(formData.get("profileId") ?? "");

  if (!profileId) {
    throw new Error("Trader profile request is invalid.");
  }

  await db
    .update(traderProfilesSchema)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(traderProfilesSchema.id, profileId),
        eq(traderProfilesSchema.userId, session.user.id),
      ),
    );

  invalidateAfterMutation({
    paths: [
      TRADER_PROFILE_PATH,
      MARKETPLACE_PATH,
      COPY_TRADING_PATH,
      DASHBOARD_PATH,
      ADMIN_COPY_TRADING_PATH,
    ],
    tags: [
      cacheTags.userTraderProfile(session.user.id),
      cacheTags.userCopyTrading(session.user.id),
      cacheTags.userDashboard(session.user.id),
      CACHE_TAGS.traderMarketplace,
      CACHE_TAGS.adminCopyTrading,
    ],
  });
}
