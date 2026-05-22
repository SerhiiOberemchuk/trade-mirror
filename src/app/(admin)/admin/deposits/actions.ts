"use server";

import { db } from "@/db";
import { depositRequestsSchema } from "@/db/schema/wallet.schema";
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

const ADMIN_DEPOSITS_PATH = "/admin/deposits";
const NOTIFICATIONS_PATH = "/notifications";
const WALLET_PATH = "/wallet";

export async function approveDepositAction(formData: FormData): Promise<ActionResult> {
  return reviewDeposit(formData, "approved");
}

export async function rejectDepositAction(formData: FormData): Promise<ActionResult> {
  return reviewDeposit(formData, "rejected");
}

async function reviewDeposit(
  formData: FormData,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  const session = await requireAdminSession();
  const depositId = String(formData.get("depositId") ?? "");

  if (!depositId) {
    return actionError("Invalid deposit review request.");
  }

  try {
    const [deposit] = await db
      .select()
      .from(depositRequestsSchema)
      .where(eq(depositRequestsSchema.id, depositId))
      .limit(1);

    if (!deposit) {
      return actionError("Deposit request was not found.");
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

    await createUserNotification({
      body:
        status === "approved"
          ? `Your simulated deposit for ${formatMoney(deposit.amountCents)} was approved.`
          : `Your simulated deposit for ${formatMoney(deposit.amountCents)} was rejected.`,
      href: "/wallet",
      title: status === "approved" ? "Deposit approved" : "Deposit rejected",
      type: "deposit",
      userId: deposit.userId,
    });

    invalidateAfterMutation({
      paths: [ADMIN_DEPOSITS_PATH, WALLET_PATH, NOTIFICATIONS_PATH],
      tags: [
        CACHE_TAGS.adminDeposits,
        ...(deposit.userId
          ? [cacheTags.userNotifications(deposit.userId), cacheTags.userWallet(deposit.userId)]
          : []),
      ],
    });

    return actionSuccess("Deposit review updated.");
  } catch {
    return actionError("Unable to update this deposit review. Please try again.");
  }
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}
