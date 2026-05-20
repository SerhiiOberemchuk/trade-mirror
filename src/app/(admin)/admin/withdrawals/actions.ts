"use server";

import { db } from "@/db";
import { withdrawalRequestsSchema } from "@/db/schema/wallet.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const ADMIN_WITHDRAWALS_PATH = "/admin/withdrawals";

export async function approveWithdrawalAction(formData: FormData) {
  await reviewWithdrawal(formData, "approved");
}

export async function rejectWithdrawalAction(formData: FormData) {
  await reviewWithdrawal(formData, "rejected");
}

async function reviewWithdrawal(
  formData: FormData,
  status: "approved" | "rejected",
) {
  const session = await requireAdminSession();
  const withdrawalId = String(formData.get("withdrawalId") ?? "");

  if (!withdrawalId) {
    throw new Error("Invalid withdrawal review request.");
  }

  await db
    .update(withdrawalRequestsSchema)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNote:
        status === "approved" ? "Approved by admin." : "Rejected by admin.",
    })
    .where(eq(withdrawalRequestsSchema.id, withdrawalId));

  invalidateAfterMutation({
    paths: [ADMIN_WITHDRAWALS_PATH],
    tags: [CACHE_TAGS.adminWithdrawals],
  });
}
