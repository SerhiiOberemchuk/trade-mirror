import { auth } from "@/lib/auth";
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
  const { role } = session.user;
  const isAdmin = Array.isArray(role) ? role.includes("admin") : role === "admin";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return session;
}
