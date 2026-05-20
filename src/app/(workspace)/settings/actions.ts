"use server";

import { auth } from "@/lib/auth";
import { cacheTags } from "@/lib/cache-tags";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { headers } from "next/headers";

const SETTINGS_PATH = "/settings";
const DASHBOARD_PATH = "/dashboard";

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    throw new Error("Display name must be 2-80 characters.");
  }

  await auth.api.updateUser({
    body: {
      name,
    },
    headers: await headers(),
  });

  invalidateAfterMutation({
    paths: [SETTINGS_PATH, DASHBOARD_PATH],
    tags: [cacheTags.userSettings(session.user.id)],
  });
}
