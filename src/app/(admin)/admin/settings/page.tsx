import { adminSettings } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        description="Platform settings surface for operational controls before persistence exists."
        title="Platform Settings"
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {adminSettings.map((group) => (
          <AdminCard description="Static configuration controls" key={group.section} title={group.section}>
            <div className="space-y-3">
              {group.rows.map((row) => (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm" key={row}>
                  <span>{row}</span>
                  <span className="text-muted">Edit</span>
                </div>
              ))}
            </div>
          </AdminCard>
        ))}
      </section>
    </>
  );
}
