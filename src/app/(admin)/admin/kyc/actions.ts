"use server";

import { db } from "@/db";
import { kycRequestsSchema } from "@/db/schema/kyc.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const VERIFICATION_PATH = "/verification";
const ADMIN_KYC_PATH = "/admin/kyc";

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

    invalidateAfterMutation({
      paths: [VERIFICATION_PATH, ADMIN_KYC_PATH],
      tags: [CACHE_TAGS.adminKyc],
    });

    return actionSuccess("KYC review updated.");
  } catch {
    return actionError("Unable to update this KYC review. Please try again.");
  }
}
