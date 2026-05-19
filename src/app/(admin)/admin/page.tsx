import {
  adminCopyActivity,
  adminStats,
  adminSupportTickets,
  adminWithdrawals,
} from "@/data/admin";
import {
  AdminCard,
  AdminPageHeader,
  AdminStatTile,
  ReviewActions,
} from "@/components/admin-shell";

export default function AdminOverviewPage() {
  return (
    <>
      <AdminPageHeader
        description="Operations overview for simulated users, trading activity, finance reviews, and support load."
        title="Admin Overview"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <AdminStatTile change={stat.change} key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <AdminCard description="Requests waiting for operations review" title="Withdrawal queue">
          <div className="space-y-3">
            {adminWithdrawals.map((request) => (
              <div className="rounded-lg border border-border bg-background p-4" key={`${request.user}-${request.amount}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{request.user}</p>
                    <p className="mt-1 text-sm text-muted">{request.amount} · {request.risk} risk</p>
                  </div>
                  <ReviewActions />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard description="Copy relationships requiring monitoring" title="Copy trading activity">
          <div className="space-y-3">
            {adminCopyActivity.map((activity) => (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm" key={`${activity.leader}-${activity.follower}`}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{activity.leader} → {activity.follower}</p>
                  <p className="text-warning">{activity.status}</p>
                </div>
                <p className="mt-2 text-muted">{activity.ratio} ratio · {activity.allocation}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </section>

      <section className="mt-6">
        <AdminCard description="Latest operational support workload" title="Support escalation">
          <div className="grid gap-3 md:grid-cols-3">
            {adminSupportTickets.map((ticket) => (
              <div className="rounded-lg border border-border bg-background p-4" key={ticket.subject}>
                <p className="font-medium">{ticket.subject}</p>
                <p className="mt-2 text-sm text-muted">{ticket.user} · {ticket.updated}</p>
                <p className="mt-3 font-mono text-sm text-warning">{ticket.priority}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </section>
    </>
  );
}
