"use server";

import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { and, eq } from "drizzle-orm";

const COPY_TRADING_PATH = "/copy-trading";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_COPY_TRADING_PATH = "/admin/copy-trading";

export async function pauseCopySettingAction(formData: FormData) {
  await updateCopySettingStatus(formData, "paused");
}

export async function resumeCopySettingAction(formData: FormData) {
  await updateCopySettingStatus(formData, "active");
}

async function updateCopySettingStatus(
  formData: FormData,
  status: "active" | "paused",
) {
  const session = await requireSession();
  const settingId = String(formData.get("settingId") ?? "");

  if (!settingId) {
    throw new Error("Invalid copy trading setting request.");
  }

  await db
    .update(copySettingsSchema)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(copySettingsSchema.id, settingId),
        eq(copySettingsSchema.followerUserId, session.user.id),
      ),
    );

  invalidateAfterMutation({
    paths: [COPY_TRADING_PATH, DASHBOARD_PATH, ADMIN_COPY_TRADING_PATH],
    tags: [
      cacheTags.userCopyTrading(session.user.id),
      cacheTags.userDashboard(session.user.id),
      CACHE_TAGS.adminCopyTrading,
    ],
  });
}
