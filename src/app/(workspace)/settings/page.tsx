import {
  DashboardCard,
  DashboardPageHeader,
  StatusBadge,
} from "@/components/dashboard-shell";
import { requireSession } from "@/server/auth/session";
import { ProfileForm } from "./profile-form";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <>
      <DashboardPageHeader
        description="Manage the authenticated profile used across the simulated trading workspace."
        title="Settings"
      />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <DashboardCard
          description="This name appears in wallet requests, tickets, KYC submissions, trader profiles, and admin review queues."
          title="Profile"
        >
          <ProfileForm email={session.user.email} name={session.user.name} />
        </DashboardCard>

        <DashboardCard
          description="Current Better Auth account state"
          title="Account status"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <span>Email verification</span>
              <StatusBadge
                tone={session.user.emailVerified ? "success" : "warning"}
              >
                {session.user.emailVerified ? "Verified" : "Pending"}
              </StatusBadge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <span>Role</span>
              <span className="font-mono text-muted">
                {formatRole(session.user.role)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <span>User ID</span>
              <span className="max-w-48 truncate font-mono text-muted">
                {session.user.id}
              </span>
            </div>
          </div>
        </DashboardCard>
      </section>
    </>
  );
}

function formatRole(role: string | string[] | null | undefined) {
  if (Array.isArray(role)) {
    return role.join(", ");
  }

  return role ?? "user";
}
