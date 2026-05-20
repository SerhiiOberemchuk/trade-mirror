"use server";

import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const SUPPORT_PATH = "/support";
const ADMIN_SUPPORT_PATH = "/admin/support";

export async function replySupportTicketAction(formData: FormData) {
  await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const adminReply = String(formData.get("adminReply") ?? "").trim();

  if (!ticketId) {
    throw new Error("Invalid support ticket reply request.");
  }

  if (adminReply.length < 4 || adminReply.length > 2_000) {
    throw new Error("Support reply must be 4-2000 characters.");
  }

  await db
    .update(supportTickets)
    .set({
      adminReply,
      status: "answered",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidateSupportPaths();
}

export async function closeSupportTicketAction(formData: FormData) {
  const session = await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");

  if (!ticketId) {
    throw new Error("Invalid support ticket close request.");
  }

  await db
    .update(supportTickets)
    .set({
      closedAt: new Date(),
      closedById: session.user.id,
      status: "closed",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidateSupportPaths();
}

export async function reopenSupportTicketAction(formData: FormData) {
  await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");

  if (!ticketId) {
    throw new Error("Invalid support ticket reopen request.");
  }

  await db
    .update(supportTickets)
    .set({
      closedAt: null,
      closedById: null,
      status: "open",
      updatedAt: new Date(),
    })
    .where(eq(supportTickets.id, ticketId));

  revalidateSupportPaths();
}

function revalidateSupportPaths() {
  revalidatePath(SUPPORT_PATH);
  revalidatePath(ADMIN_SUPPORT_PATH);
}
