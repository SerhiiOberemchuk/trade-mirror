"use server";

import { db } from "@/db";
import { withdrawalRequestsSchema } from "@/db/schema/wallet.schema";
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

const ADMIN_WITHDRAWALS_PATH = "/admin/withdrawals";
const NOTIFICATIONS_PATH = "/notifications";
const WALLET_PATH = "/wallet";

export async function approveWithdrawalAction(formData: FormData): Promise<ActionResult> {
  return reviewWithdrawal(formData, "approved");
}

export async function rejectWithdrawalAction(formData: FormData): Promise<ActionResult> {
  return reviewWithdrawal(formData, "rejected");
}

async function reviewWithdrawal(
  formData: FormData,
  status: "approved" | "rejected",
): Promise<ActionResult> {
  const session = await requireAdminSession();
  const withdrawalId = String(formData.get("withdrawalId") ?? "");

  if (!withdrawalId) {
    return actionError("Invalid withdrawal review request.");
  }

  try {
    const [withdrawal] = await db
      .select()
      .from(withdrawalRequestsSchema)
      .where(eq(withdrawalRequestsSchema.id, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      return actionError("Withdrawal request was not found.");
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

    await createUserNotification({
      body:
        status === "approved"
          ? `Your simulated withdrawal for ${formatMoney(withdrawal.amountCents)} was approved.`
          : `Your simulated withdrawal for ${formatMoney(withdrawal.amountCents)} was rejected.`,
      href: "/wallet",
      title: status === "approved" ? "Withdrawal approved" : "Withdrawal rejected",
      type: "withdrawal",
      userId: withdrawal.userId,
    });

    invalidateAfterMutation({
      paths: [ADMIN_WITHDRAWALS_PATH, WALLET_PATH, NOTIFICATIONS_PATH],
      tags: [
        CACHE_TAGS.adminWithdrawals,
        ...(withdrawal.userId
          ? [
              cacheTags.userNotifications(withdrawal.userId),
              cacheTags.userWallet(withdrawal.userId),
            ]
          : []),
      ],
    });

    return actionSuccess("Withdrawal review updated.");
  } catch {
    return actionError("Unable to update this withdrawal review. Please try again.");
  }
}

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(amountCents / 100);
}
