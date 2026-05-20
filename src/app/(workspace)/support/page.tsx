import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { requireSession } from "@/server/auth/session";
import {
  DashboardCard,
  DashboardPageHeader,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-shell";
import { desc, eq } from "drizzle-orm";
import { createSupportTicketAction } from "./actions";

type SupportTicketRow = {
  id: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "answered" | "closed";
  updated: string;
  adminReply: string | null;
};

export default async function SupportPage() {
  const session = await requireSession();
  const state = await getUserSupportTickets(session.user.id);

  return (
    <>
      <DashboardPageHeader
        description="Support ticket queue for user-side assistance and admin responses."
        title="Support"
      />

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardCard description="Create a persisted support request" title="New ticket">
          <form action={createSupportTicketAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Subject</span>
              <input
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={120}
                minLength={4}
                name="subject"
                placeholder="Withdrawal review question"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Priority</span>
              <select
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                defaultValue="medium"
                name="priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Message</span>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                maxLength={2000}
                minLength={10}
                name="message"
                placeholder="Describe what you need help with."
              />
            </label>

            <button
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Submit ticket
            </button>
          </form>
        </DashboardCard>

        <DashboardCard description="Your persisted support tickets" title="Tickets">
          {state.kind === "ready" && state.rows.length > 0 ? (
            <div className="space-y-3">
              {state.rows.map((ticket) => (
                <article className="rounded-lg border border-border bg-background p-4" key={ticket.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{ticket.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <StatusBadge tone={getPriorityTone(ticket.priority)}>{ticket.priority}</StatusBadge>
                      <StatusBadge tone={getStatusTone(ticket.status)}>{ticket.status}</StatusBadge>
                    </div>
                  </div>
                  {ticket.adminReply ? (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                      {ticket.adminReply}
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs text-muted">Updated {ticket.updated}</p>
                </article>
              ))}
            </div>
          ) : null}

          {state.kind === "ready" && state.rows.length === 0 ? (
            <EmptyState
              description="Create a ticket and the admin team will see it in the support queue."
              title="No support tickets"
            />
          ) : null}

          {state.kind === "setup-required" ? (
            <EmptyState
              description="The support ticket table is not available yet. Apply the generated Drizzle migration before creating tickets."
              title="Support tickets are not ready"
            />
          ) : null}
        </DashboardCard>
      </section>
    </>
  );
}

async function getUserSupportTickets(userId: string): Promise<
  | { kind: "ready"; rows: SupportTicketRow[] }
  | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.updatedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        adminReply: row.adminReply,
        id: row.id,
        message: row.message,
        priority: row.priority,
        status: row.status,
        subject: row.subject,
        updated: formatDate(row.updatedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPriorityTone(priority: SupportTicketRow["priority"]) {
  if (priority === "high") {
    return "danger";
  }

  if (priority === "medium") {
    return "warning";
  }

  return "muted";
}

function getStatusTone(status: SupportTicketRow["status"]) {
  if (status === "closed") {
    return "success";
  }

  if (status === "answered") {
    return "primary";
  }

  return "warning";
}
