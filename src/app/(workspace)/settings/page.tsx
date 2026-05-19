import { settingsGroups } from "@/data/dashboard";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function SettingsPage() {
  return (
    <>
      <DashboardPageHeader
        description="Account, trading, and security preferences preview before persistence and auth are added."
        title="Settings"
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {settingsGroups.map((group) => (
          <DashboardCard description="Static settings surface" key={group.title} title={group.title}>
            <div className="space-y-3">
              {group.rows.map((row) => (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm" key={row}>
                  <span>{row}</span>
                  <span className="text-muted">Configure</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        ))}
      </section>
    </>
  );
}
