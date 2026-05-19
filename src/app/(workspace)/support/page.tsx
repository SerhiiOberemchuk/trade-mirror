import { supportTickets } from "@/data/dashboard";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function SupportPage() {
  return (
    <>
      <DashboardPageHeader
        action={
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950">
            New ticket
          </button>
        }
        description="Support chat and ticket queue preview for user-side assistance."
        title="Support"
      />

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardCard description="Ticket states" title="Tickets">
          <div className="space-y-3">
            {supportTickets.map((ticket) => (
              <div className="rounded-lg border border-border bg-background p-4" key={ticket.subject}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{ticket.subject}</p>
                  <span className="text-sm text-primary">{ticket.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{ticket.priority} priority · {ticket.updated}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Static live chat composition" title="Support chat">
          <div className="space-y-3">
            <Message align="left" text="Hi, we are reviewing your verification document." />
            <Message align="right" text="Thanks. Can I continue using the demo wallet meanwhile?" />
            <Message align="left" text="Yes, trading simulation remains available during review." />
          </div>
          <div className="mt-5 flex gap-3">
            <input
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none placeholder:text-muted"
              placeholder="Write a reply"
            />
            <button className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950">
              Send
            </button>
          </div>
        </DashboardCard>
      </section>
    </>
  );
}

function Message({ text, align }: { text: string; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[75%] rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6">
        {text}
      </div>
    </div>
  );
}
