import { DashboardShell } from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { getUnreadNotificationCount } from "@/server/notifications/notifications";
import { Suspense } from "react";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<WorkspaceShellFallback />}>
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}

async function AuthenticatedWorkspace({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  const unreadNotifications = await getUnreadNotificationCount(session.user.id);

  return (
    <DashboardShell
      unreadNotifications={unreadNotifications}
      user={session.user}
    >
      {children}
    </DashboardShell>
  );
}

function WorkspaceShellFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
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
