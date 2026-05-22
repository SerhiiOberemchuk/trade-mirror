"use server";

import { db } from "@/db";
import { kycRequestsSchema } from "@/db/schema/kyc.schema";
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

const VERIFICATION_PATH = "/verification";
const ADMIN_KYC_PATH = "/admin/kyc";
const NOTIFICATIONS_PATH = "/notifications";

export async function approveKycRequestAction(formData: FormData): Promise<ActionResult> {
  return reviewKycRequest(formData, "approved");
}

export async function rejectKycRequestAction(formData: FormData): Promise<ActionResult> {
  return reviewKycRequest(formData, "rejected");
}

async function reviewKycRequest(
  formData: FormData,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  const session = await requireAdminSession();
  const requestId = String(formData.get("requestId") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim();

  if (!requestId) {
    return actionError("Invalid KYC review request.");
  }

  if (reviewNote.length > 500) {
    return actionError("KYC review note must be 500 characters or fewer.");
  }

  try {
    const [request] = await db
      .select()
      .from(kycRequestsSchema)
      .where(eq(kycRequestsSchema.id, requestId))
      .limit(1);

    if (!request) {
      return actionError("KYC request was not found.");
    }

    await db
      .update(kycRequestsSchema)
      .set({
        reviewedAt: new Date(),
        reviewedById: session.user.id,
        reviewNote:
          reviewNote ||
          (status === "approved" ? "Approved by admin." : "Rejected by admin."),
        status,
      })
      .where(eq(kycRequestsSchema.id, requestId));

    await createUserNotification({
      body:
        status === "approved"
          ? "Your simulated verification request was approved."
          : "Your simulated verification request was rejected.",
      href: VERIFICATION_PATH,
      title: status === "approved" ? "Verification approved" : "Verification rejected",
      type: "kyc",
      userId: request.userId,
    });

    invalidateAfterMutation({
      paths: [VERIFICATION_PATH, ADMIN_KYC_PATH, NOTIFICATIONS_PATH],
      tags: [
        CACHE_TAGS.adminKyc,
        ...(request.userId
          ? [
              cacheTags.userNotifications(request.userId),
              cacheTags.userVerification(request.userId),
            ]
          : []),
      ],
    });

    return actionSuccess("KYC review updated.");
  } catch {
    return actionError("Unable to update this KYC review. Please try again.");
  }
}
