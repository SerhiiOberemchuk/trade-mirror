"use server";

import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

const SUPPORT_PATH = "/support";
const ADMIN_SUPPORT_PATH = "/admin/support";
const VALID_PRIORITIES = ["low", "medium", "high"] as const;

type SupportTicketPriority = (typeof VALID_PRIORITIES)[number];

export async function createSupportTicketAction(formData: FormData) {
  const session = await requireSession();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");

  if (subject.length < 4 || subject.length > 120) {
    throw new Error("Support ticket subject must be 4-120 characters.");
  }

  if (message.length < 10 || message.length > 2_000) {
    throw new Error("Support ticket message must be 10-2000 characters.");
  }

  if (!isSupportTicketPriority(priority)) {
    throw new Error("Support ticket priority is invalid.");
  }

  await db.insert(supportTickets).values({
    message,
    priority,
    subject,
    userEmail: session.user.email,
    userId: session.user.id,
    userName: session.user.name,
  });

  revalidatePath(SUPPORT_PATH);
  revalidatePath(ADMIN_SUPPORT_PATH);
}

function isSupportTicketPriority(priority: string): priority is SupportTicketPriority {
  return VALID_PRIORITIES.includes(priority as SupportTicketPriority);
}
