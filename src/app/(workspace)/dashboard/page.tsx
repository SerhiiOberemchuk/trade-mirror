import {
  copyAllocations,
  dashboardStats,
  openPositions,
  supportTickets,
} from "@/data/dashboard";
import {
  DashboardCard,
  DashboardPageHeader,
  StatTile,
} from "@/components/dashboard-shell";

export default function DashboardPage() {
  return (
    <>
      <DashboardPageHeader
        description="Portfolio-level preview of simulated wallet exposure, copied trader activity, and support status."
        title="Overview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatTile change={stat.change} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard description="Current simulated exposure" title="Open positions">
          <div className="space-y-3">
            {openPositions.map((position) => (
              <Row
                key={position.pair}
                meta={`${position.side} · ${position.size} · Entry ${position.entry}`}
                tone={position.pnl.startsWith("+") ? "success" : "danger"}
                title={position.pair}
                value={position.pnl}
              />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Provider allocations" title="Copy trading">
          <div className="space-y-3">
            {copyAllocations.map((allocation) => (
              <Row
                key={allocation.trader}
                meta={`${allocation.copyRatio} copy · ${allocation.risk} risk`}
                title={allocation.trader}
                value={allocation.status}
              />
            ))}
          </div>
        </DashboardCard>
      </section>

      <section className="mt-6">
        <DashboardCard description="Latest user support states" title="Support queue">
          <div className="grid gap-3 md:grid-cols-3">
            {supportTickets.map((ticket) => (
              <div className="rounded-lg border border-border bg-background p-4" key={ticket.subject}>
                <p className="font-medium">{ticket.subject}</p>
                <p className="mt-2 text-sm text-muted">{ticket.priority} priority · {ticket.updated}</p>
                <p className="mt-3 font-mono text-sm text-primary">{ticket.status}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}

function Row({
  title,
  meta,
  value,
  tone,
}: {
  title: string;
  meta: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{meta}</p>
      </div>
      <p
        className={`font-mono text-sm ${
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
