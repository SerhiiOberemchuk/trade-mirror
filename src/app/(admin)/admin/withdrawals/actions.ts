"use server";

import { db } from "@/db";
import { withdrawalRequests } from "@/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    .update(withdrawalRequests)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNote: status === "approved" ? "Approved by admin." : "Rejected by admin.",
    })
    .where(eq(withdrawalRequests.id, withdrawalId));

  revalidatePath(ADMIN_WITHDRAWALS_PATH);
}
