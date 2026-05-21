"use server";

import { auth } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { headers } from "next/headers";

const ADMIN_USERS_PATH = "/admin/users";

export async function setUserRoleAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !["admin", "user"].includes(role)) {
    return actionError("Invalid user role update.");
  }

  const safeRole = role as "admin" | "user";

  try {
    await auth.api.setRole({
      body: {
        userId,
        role: safeRole,
      },
      headers: await headers(),
    });

    invalidateAdminUsers();

    return actionSuccess("User role updated.");
  } catch {
    return actionError("Unable to update this user role. Please try again.");
  }
}

export async function banUserAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    return actionError("Invalid user ban request.");
  }

  try {
    await auth.api.banUser({
      body: {
        userId,
        banReason: "Disabled by TradeMirror admin.",
      },
      headers: await headers(),
    });

    invalidateAdminUsers();

    return actionSuccess("User banned.");
  } catch {
    return actionError("Unable to ban this user. Please try again.");
  }
}

export async function unbanUserAction(formData: FormData): Promise<ActionResult> {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    return actionError("Invalid user unban request.");
  }

  try {
    await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    invalidateAdminUsers();

    return actionSuccess("User unbanned.");
  } catch {
    return actionError("Unable to unban this user. Please try again.");
  }
}

function invalidateAdminUsers() {
  invalidateAfterMutation({
    paths: [ADMIN_USERS_PATH],
    tags: [CACHE_TAGS.adminUsers],
  });
}
