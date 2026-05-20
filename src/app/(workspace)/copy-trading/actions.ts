"use server";

import { db } from "@/db";
import { copySettings } from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const COPY_TRADING_PATH = "/copy-trading";
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
    .update(copySettings)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(copySettings.id, settingId),
        eq(copySettings.followerUserId, session.user.id),
      ),
    );

  revalidatePath(COPY_TRADING_PATH);
  revalidatePath(ADMIN_COPY_TRADING_PATH);
}
