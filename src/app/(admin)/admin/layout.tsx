import { AdminShell } from "@/components/admin-shell";
import { hasAdminRole } from "@/lib/auth-roles";
import { requireAdminSession } from "@/server/auth/session";
import { getUnreadNotificationCount } from "@/server/notifications/notifications";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AuthenticatedAdmin>{children}</AuthenticatedAdmin>
    </Suspense>
  );
}

async function AuthenticatedAdmin({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();
  const unreadNotifications = await getUnreadNotificationCount(session.user.id);

  return (
    <AdminShell
      canSwitchWorkspaceMode={hasAdminRole(session.user.role)}
      unreadNotifications={unreadNotifications}
      user={session.user}
    >
      {children}
    </AdminShell>
  );
}

function AdminShellFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-surface lg:block" />
        <section className="min-w-0">
          <div className="h-16 border-b border-border bg-surface" />
          <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
            <div className="h-24 rounded-lg border border-border bg-card" />
          </div>
        </section>
      </div>
    </main>
  );
}
