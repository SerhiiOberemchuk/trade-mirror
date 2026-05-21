"use server";

import { db } from "@/db";
import {
  supportTicketPriorityEnum,
  supportTicketsSchema,
} from "@/db/schema/support.schema";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";

const SUPPORT_PATH = "/support";
const DASHBOARD_PATH = "/dashboard";
const ADMIN_SUPPORT_PATH = "/admin/support";

type SupportTicketPriority =
  (typeof supportTicketPriorityEnum.enumValues)[number];

export type SupportTicketActionState = ActionResult;

export async function createSupportTicketAction(
  _state: SupportTicketActionState,
  formData: FormData,
): Promise<SupportTicketActionState> {
  const session = await requireSession();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium");

  if (subject.length < 4 || subject.length > 120) {
    return actionError("Support ticket subject must be 4-120 characters.");
  }

  if (message.length < 10 || message.length > 2_000) {
    return actionError("Support ticket message must be 10-2000 characters.");
  }

  if (!isSupportTicketPriority(priority)) {
    return actionError("Support ticket priority is invalid.");
  }

  try {
    await db.insert(supportTicketsSchema).values({
      message,
      priority,
      subject,
      userEmail: session.user.email,
      userId: session.user.id,
      userName: session.user.name,
    });

    invalidateAfterMutation({
      paths: [SUPPORT_PATH, DASHBOARD_PATH, ADMIN_SUPPORT_PATH],
      tags: [
        cacheTags.userSupport(session.user.id),
        cacheTags.userDashboard(session.user.id),
        CACHE_TAGS.adminSupport,
      ],
    });

    return actionSuccess("Support ticket submitted.");
  } catch {
    return actionError("Unable to submit this support ticket. Please try again.");
  }
}

function isSupportTicketPriority(
  priority: string,
): priority is SupportTicketPriority {
  return supportTicketPriorityEnum.enumValues.includes(
    priority as SupportTicketPriority,
  );
}
