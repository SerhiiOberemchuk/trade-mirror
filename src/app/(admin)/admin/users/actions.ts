"use server";

import { auth } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireAdminSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { headers } from "next/headers";

const ADMIN_USERS_PATH = "/admin/users";

export async function setUserRoleAction(formData: FormData) {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId || !["admin", "user"].includes(role)) {
    throw new Error("Invalid user role update.");
  }

  const safeRole = role as "admin" | "user";

  await auth.api.setRole({
    body: {
      userId,
      role: safeRole,
    },
    headers: await headers(),
  });

  invalidateAdminUsers();
}

export async function banUserAction(formData: FormData) {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    throw new Error("Invalid user ban request.");
  }

  await auth.api.banUser({
    body: {
      userId,
      banReason: "Disabled by TradeMirror admin.",
    },
    headers: await headers(),
  });

  invalidateAdminUsers();
}

export async function unbanUserAction(formData: FormData) {
  await requireAdminSession();

  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    throw new Error("Invalid user unban request.");
  }

  await auth.api.unbanUser({
    body: {
      userId,
    },
    headers: await headers(),
  });

  invalidateAdminUsers();
}

function invalidateAdminUsers() {
  invalidateAfterMutation({
    paths: [ADMIN_USERS_PATH],
    tags: [CACHE_TAGS.adminUsers],
  });
}
