"use server";

import { db } from "@/db";
import { kycRequests } from "@/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    .update(kycRequests)
    .set({
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNote: reviewNote || (status === "approved" ? "Approved by admin." : "Rejected by admin."),
      status,
    })
    .where(eq(kycRequests.id, requestId));

  revalidatePath(VERIFICATION_PATH);
  revalidatePath(ADMIN_KYC_PATH);
}
