import { db } from "@/db";
import {
  notificationTypeEnum,
  notificationsSchema,
} from "@/db/schema/notifications.schema";
import { and, count, desc, eq } from "drizzle-orm";
import { user } from "../../../auth-schema";

type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

type CreateNotificationInput = {
  body: string;
  href?: string;
  title: string;
  type?: NotificationType;
  userId: string | null | undefined;
};

export type NotificationRow = typeof notificationsSchema.$inferSelect;

export async function createUserNotification(input: CreateNotificationInput) {
  if (!input.userId) {
    return;
  }

  try {
    await db.insert(notificationsSchema).values({
      body: input.body,
      href: input.href,
      title: input.title,
      type: input.type ?? "system",
      userId: input.userId,
    });
  } catch {
    // Notifications must not block the primary workflow while migrations are being applied.
  }
}

export async function createAdminNotification(
  input: Omit<CreateNotificationInput, "userId">,
) {
  try {
    const adminRows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, "admin"));

    await Promise.all(
      adminRows.map((adminUser) =>
        createUserNotification({
          ...input,
          userId: adminUser.id,
        }),
      ),
    );
  } catch {
    // Missing notification table should not break user-facing mutation flows.
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const [row] = await db
      .select({ value: count() })
      .from(notificationsSchema)
      .where(
        and(
          eq(notificationsSchema.userId, userId),
          eq(notificationsSchema.isRead, false),
        ),
      );

    return row?.value ?? 0;
  } catch {
    return 0;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const rows = await db
      .select()
      .from(notificationsSchema)
      .where(eq(notificationsSchema.userId, userId))
      .orderBy(desc(notificationsSchema.createdAt))
      .limit(80);

    return { kind: "ready" as const, rows };
  } catch {
    return { kind: "setup-required" as const };
  }
}
