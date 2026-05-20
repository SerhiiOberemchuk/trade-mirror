"use server";

import { db } from "@/db";
import { kycRequestsSchema } from "@/db/schema/kyc.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const VERIFICATION_PATH = "/verification";
const ADMIN_KYC_PATH = "/admin/kyc";

export async function approveKycRequestAction(formData: FormData) {
  await reviewKycRequest(formData, "approved");
}

export async function rejectKycRequestAction(formData: FormData) {
  await reviewKycRequest(formData, "rejected");
}

async function reviewKycRequest(
  formData: FormData,
  status: "approved" | "rejected",
) {
  const session = await requireAdminSession();
  const requestId = String(formData.get("requestId") ?? "");
  const reviewNote = String(formData.get("reviewNote") ?? "").trim();

  if (!requestId) {
    throw new Error("Invalid KYC review request.");
  }

  if (reviewNote.length > 500) {
    throw new Error("KYC review note must be 500 characters or fewer.");
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

  invalidateAfterMutation({
    paths: [VERIFICATION_PATH, ADMIN_KYC_PATH],
    tags: [CACHE_TAGS.adminKyc],
  });
}
