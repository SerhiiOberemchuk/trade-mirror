import { getPostLoginRoute } from "@/lib/auth-roles";
import { requireSession } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function WorkspaceEntryPage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceRedirect />
    </Suspense>
  );
}

async function WorkspaceRedirect() {
  const session = await requireSession();

  redirect(getPostLoginRoute(session.user.role));

  return null;
}
