"use server";

import { db } from "@/db";
import { notificationsSchema } from "@/db/schema/notifications.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import { actionError, actionSuccess, type ActionResult } from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { and, eq } from "drizzle-orm";

const NOTIFICATIONS_PATH = "/notifications";
const ADMIN_NOTIFICATIONS_PATH = "/admin/notifications";

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await requireSession();

  try {
    await db
      .update(notificationsSchema)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationsSchema.userId, session.user.id),
          eq(notificationsSchema.isRead, false),
        ),
      );

    invalidateNotifications(session.user.id);

    return actionSuccess("Notifications marked as read.");
  } catch {
    return actionError("Unable to update notifications. Apply the pending migration and try again.");
  }
}

export async function markNotificationReadAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const notificationId = String(formData.get("notificationId") ?? "");

  if (!notificationId) {
    return actionError("Invalid notification request.");
  }

  try {
    await db
      .update(notificationsSchema)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationsSchema.id, notificationId),
          eq(notificationsSchema.userId, session.user.id),
        ),
      );

    invalidateNotifications(session.user.id);

    return actionSuccess("Notification marked as read.");
  } catch {
    return actionError("Unable to update this notification.");
  }
}

function invalidateNotifications(userId: string) {
  invalidateAfterMutation({
    paths: [NOTIFICATIONS_PATH, ADMIN_NOTIFICATIONS_PATH, "/dashboard", "/admin"],
    tags: [cacheTags.userNotifications(userId), CACHE_TAGS.adminNotifications],
  });
}
