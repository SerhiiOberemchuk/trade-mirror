"use server";

import { db } from "@/db";
import { supportTicketsSchema } from "@/db/schema/support.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { createUserNotification } from "@/server/notifications/notifications";
import { eq } from "drizzle-orm";

const SUPPORT_PATH = "/support";
const ADMIN_SUPPORT_PATH = "/admin/support";
const NOTIFICATIONS_PATH = "/notifications";

export async function replySupportTicketAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const adminReply = String(formData.get("adminReply") ?? "").trim();

  if (!ticketId) {
    return actionError("Invalid support ticket reply request.");
  }

  if (adminReply.length < 4 || adminReply.length > 2_000) {
    return actionError("Support reply must be 4-2000 characters.");
  }

  try {
    const [ticket] = await db
      .select()
      .from(supportTicketsSchema)
      .where(eq(supportTicketsSchema.id, ticketId))
      .limit(1);

    if (!ticket) {
      return actionError("Support ticket was not found.");
    }

    await db
      .update(supportTicketsSchema)
      .set({
        adminReply,
        status: "answered",
        updatedAt: new Date(),
      })
      .where(eq(supportTicketsSchema.id, ticketId));

    await createUserNotification({
      body: `Admin replied to your support ticket: ${ticket.subject}.`,
      href: SUPPORT_PATH,
      title: "Support reply received",
      type: "support",
      userId: ticket.userId,
    });

    revalidateSupportPathsForUser(ticket.userId);

    return actionSuccess("Support reply sent.");
  } catch {
    return actionError("Unable to reply to this support ticket. Please try again.");
  }
}

export async function closeSupportTicketAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");

  if (!ticketId) {
    return actionError("Invalid support ticket close request.");
  }

  try {
    const [ticket] = await db
      .select()
      .from(supportTicketsSchema)
      .where(eq(supportTicketsSchema.id, ticketId))
      .limit(1);

    if (!ticket) {
      return actionError("Support ticket was not found.");
    }

    await db
      .update(supportTicketsSchema)
      .set({
        closedAt: new Date(),
        closedById: session.user.id,
        status: "closed",
        updatedAt: new Date(),
      })
      .where(eq(supportTicketsSchema.id, ticketId));

    await createUserNotification({
      body: `Your support ticket was closed: ${ticket.subject}.`,
      href: SUPPORT_PATH,
      title: "Support ticket closed",
      type: "support",
      userId: ticket.userId,
    });

    revalidateSupportPathsForUser(ticket.userId);

    return actionSuccess("Support ticket closed.");
  } catch {
    return actionError("Unable to close this support ticket. Please try again.");
  }
}

export async function reopenSupportTicketAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");

  if (!ticketId) {
    return actionError("Invalid support ticket reopen request.");
  }

  try {
    const [ticket] = await db
      .select()
      .from(supportTicketsSchema)
      .where(eq(supportTicketsSchema.id, ticketId))
      .limit(1);

    if (!ticket) {
      return actionError("Support ticket was not found.");
    }

    await db
      .update(supportTicketsSchema)
      .set({
        closedAt: null,
        closedById: null,
        status: "open",
        updatedAt: new Date(),
      })
      .where(eq(supportTicketsSchema.id, ticketId));

    await createUserNotification({
      body: `Your support ticket was reopened: ${ticket.subject}.`,
      href: SUPPORT_PATH,
      title: "Support ticket reopened",
      type: "support",
      userId: ticket.userId,
    });

    revalidateSupportPathsForUser(ticket.userId);

    return actionSuccess("Support ticket reopened.");
  } catch {
    return actionError("Unable to reopen this support ticket. Please try again.");
  }
}

function revalidateSupportPathsForUser(userId: string | null) {
  invalidateAfterMutation({
    paths: [SUPPORT_PATH, ADMIN_SUPPORT_PATH, NOTIFICATIONS_PATH],
    tags: [
      CACHE_TAGS.adminSupport,
      ...(userId ? [cacheTags.userNotifications(userId), cacheTags.userSupport(userId)] : []),
    ],
  });
}
