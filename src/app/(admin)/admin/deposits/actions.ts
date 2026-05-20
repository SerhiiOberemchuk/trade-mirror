"use server";

import { db } from "@/db";
import { depositRequestsSchema } from "@/db/schema/wallet.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { eq } from "drizzle-orm";

const ADMIN_DEPOSITS_PATH = "/admin/deposits";

export async function approveDepositAction(formData: FormData) {
  await reviewDeposit(formData, "approved");
}

export async function rejectDepositAction(formData: FormData) {
  await reviewDeposit(formData, "rejected");
}

async function reviewDeposit(
  formData: FormData,
  status: "approved" | "rejected",
) {
  const session = await requireAdminSession();
  const depositId = String(formData.get("depositId") ?? "");

  if (!depositId) {
    throw new Error("Invalid deposit review request.");
  }

  await db
    .update(depositRequestsSchema)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNote:
        status === "approved" ? "Approved by admin." : "Rejected by admin.",
    })
    .where(eq(depositRequestsSchema.id, depositId));

  invalidateAfterMutation({
    paths: [ADMIN_DEPOSITS_PATH],
    tags: [CACHE_TAGS.adminDeposits],
  });
}
