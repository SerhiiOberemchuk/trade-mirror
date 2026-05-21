"use server";

import { db } from "@/db";
import { copySettingsSchema } from "@/db/schema/copy-trading.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { and, eq } from "drizzle-orm";

const COPY_TRADING_PATH = "/copy-trading";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_COPY_TRADING_PATH = "/admin/copy-trading";

export async function pauseCopySettingAction(formData: FormData): Promise<ActionResult> {
  return updateCopySettingStatus(formData, "paused");
}

export async function resumeCopySettingAction(formData: FormData): Promise<ActionResult> {
  return updateCopySettingStatus(formData, "active");
}

async function updateCopySettingStatus(
  formData: FormData,
  status: "active" | "paused",
): Promise<ActionResult> {
  const session = await requireSession();
  const settingId = String(formData.get("settingId") ?? "");

  if (!settingId) {
    return actionError("Invalid copy trading setting request.");
  }

  try {
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

    return actionSuccess("Copy setting updated.");
  } catch {
    return actionError("Unable to update this copy setting. Please try again.");
  }
}
