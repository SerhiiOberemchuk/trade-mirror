import { auth } from "@/lib/auth";
import { hasAdminRole } from "@/lib/auth-roles";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();

  if (!hasAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}
