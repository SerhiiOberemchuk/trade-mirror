import { AdminCard, AdminPageHeader, StatusBadge } from "@/components/admin-shell";

type SettingRow = {
  label: string;
  status: "configured" | "missing" | "enabled" | "simulation";
  value: string;
};

const platformRows = [
  {
    label: "Database",
    status: process.env.DATABASE_URL ? "configured" : "missing",
    value: process.env.DATABASE_URL ? "PostgreSQL connection present" : "DATABASE_URL missing",
  },
  {
    label: "Email delivery",
    status: process.env.GOOGLE_EMAIL && process.env.GOOGLE_APP_PASSWORD ? "configured" : "missing",
    value: process.env.GOOGLE_EMAIL ? process.env.GOOGLE_EMAIL : "SMTP credentials missing",
  },
  {
    label: "Google OAuth",
    status: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? "configured" : "missing",
    value: process.env.GOOGLE_CLIENT_ID ? "OAuth credentials present" : "OAuth credentials missing",
  },
] as const satisfies readonly SettingRow[];

const workflowRows = [
  {
    label: "Financial operations",
    status: "simulation",
    value: "Deposits, withdrawals, balances, bonuses, trades",
  },
  {
    label: "Market data",
    status: "enabled",
    value: "Binance REST/SSE normalized provider",
  },
  {
    label: "Access control",
    status: "enabled",
    value: "Better Auth sessions and admin role plugin",
  },
] as const satisfies readonly SettingRow[];

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        description="Operational configuration status for the current TradeMirror environment."
        title="Platform Settings"
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <SettingsCard rows={platformRows} title="Environment" />
        <SettingsCard rows={workflowRows} title="Workflow mode" />
      </section>
    </>
  );
}

function SettingsCard({
  rows,
  title,
}: {
  rows: readonly SettingRow[];
  title: string;
}) {
  return (
    <AdminCard description="Read-only runtime status" title={title}>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            className="rounded-lg border border-border bg-background px-4 py-3 text-sm"
            key={row.label}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{row.label}</p>
                <p className="mt-1 text-muted">{row.value}</p>
              </div>
              <StatusBadge tone={getStatusTone(row.status)}>
                {row.status}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function getStatusTone(status: SettingRow["status"]) {
  if (status === "configured" || status === "enabled") {
    return "success";
  }

  if (status === "simulation") {
    return "warning";
  }

  return "danger";
}
