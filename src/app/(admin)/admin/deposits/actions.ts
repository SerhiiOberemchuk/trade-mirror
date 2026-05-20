"use server";

import { db } from "@/db";
import { depositRequests } from "@/db/schema";
import { requireAdminSession } from "@/server/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    .update(depositRequests)
    .set({
      status,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNote: status === "approved" ? "Approved by admin." : "Rejected by admin.",
    })
    .where(eq(depositRequests.id, depositId));

  revalidatePath(ADMIN_DEPOSITS_PATH);
}
