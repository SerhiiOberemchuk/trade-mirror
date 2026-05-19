import { adminSupportTickets } from "@/data/admin";
import { AdminCard, AdminPageHeader, ReviewActions } from "@/components/admin-shell";

export default function AdminSupportPage() {
  return (
    <>
      <AdminPageHeader
        description="Support ticket administration with priority and response status."
        title="Support Tickets"
      />

      <AdminCard description="Operational ticket queue" title="Tickets">
        <div className="space-y-3">
          {adminSupportTickets.map((ticket) => (
            <div className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm lg:grid-cols-[1fr_140px_120px_120px_220px]" key={ticket.subject}>
              <p className="font-medium">{ticket.subject}</p>
              <p className="text-muted">{ticket.user}</p>
              <p className="text-warning">{ticket.priority}</p>
              <p className="text-muted">{ticket.status}</p>
              <ReviewActions />
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
