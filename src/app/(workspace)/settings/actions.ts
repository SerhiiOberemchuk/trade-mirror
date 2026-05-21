"use server";

import { auth } from "@/lib/auth";
import { cacheTags } from "@/lib/cache-tags";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/server/actions/state";
import { requireSession } from "@/server/auth/session";
import { invalidateAfterMutation } from "@/server/cache/revalidation";
import { headers } from "next/headers";

const SETTINGS_PATH = "/settings";
const DASHBOARD_PATH = "/dashboard";

export type UpdateProfileActionState = ActionResult;

export async function updateProfileAction(
  _state: UpdateProfileActionState,
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return actionError("Display name must be 2-80 characters.");
  }

  try {
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

    return actionSuccess("Profile updated.");
  } catch {
    return actionError("Unable to update this profile. Please try again.");
  }
}
