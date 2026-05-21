import { db } from "@/db";
import { supportTicketsSchema } from "@/db/schema/support.schema";
import {
  ActionToolbar,
  AdminCard,
  AdminPageHeader,
  DataTable,
  EmptyState,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin-shell";
import { desc } from "drizzle-orm";
import {
  closeSupportTicketAction,
  reopenSupportTicketAction,
  replySupportTicketAction,
} from "./actions";

type SupportTicketRow = {
  id: string;
  subject: string;
  user: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "open" | "answered" | "closed";
  updated: string;
  adminReply: string | null;
};

const supportColumns = [
  {
    header: "Ticket",
    cell: (ticket) => (
      <div className="max-w-sm">
        <p className="font-medium">{ticket.subject}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {ticket.message}
        </p>
      </div>
    ),
  },
  {
    header: "User",
    cell: (ticket) => <span className="text-muted">{ticket.user}</span>,
  },
  {
    header: "Priority",
    cell: (ticket) => (
      <StatusBadge tone={getPriorityTone(ticket.priority)}>
        {ticket.priority}
      </StatusBadge>
    ),
  },
  {
    header: "Status",
    cell: (ticket) => (
      <StatusBadge tone={getStatusTone(ticket.status)}>
        {ticket.status}
      </StatusBadge>
    ),
  },
  {
    header: "Updated",
    cell: (ticket) => (
      <span className="font-mono text-muted">{ticket.updated}</span>
    ),
  },
  {
    header: "Actions",
    cell: (ticket) => <SupportTicketActions ticket={ticket} />,
  },
] as const satisfies readonly DataTableColumn<SupportTicketRow>[];

export default async function AdminSupportPage() {
  const state = await getSupportTicketRows();

  return (
    <>
      <AdminPageHeader
        description="Support ticket administration with priority, reply, close, and reopen controls."
        title="Support Tickets"
      />

      <AdminCard description="Operational ticket queue" title="Tickets">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={supportColumns}
            getRowKey={(ticket) => ticket.id}
            minWidth="1120px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="User support tickets will appear here after users submit requests."
            title="No support tickets"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted support tickets."
            title="Support ticket table is not ready"
          />
        ) : null}
      </AdminCard>
    </>
  );
}

function SupportTicketActions({ ticket }: { ticket: SupportTicketRow }) {
  return (
    <div className="min-w-72 space-y-3">
      <form action={replySupportTicketFormAction} className="space-y-2">
        <input name="ticketId" type="hidden" value={ticket.id} />
        <textarea
          className="min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
          defaultValue={ticket.adminReply ?? ""}
          maxLength={2000}
          minLength={4}
          name="adminReply"
          placeholder="Write admin reply"
        />
        <button
          className="rounded-md bg-warning px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-amber-300"
          type="submit"
        >
          Reply
        </button>
      </form>

      <ActionToolbar>
        {ticket.status === "closed" ? (
          <form action={reopenSupportTicketFormAction}>
            <input name="ticketId" type="hidden" value={ticket.id} />
            <button
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-cyan-300"
              type="submit"
            >
              Reopen
            </button>
          </form>
        ) : (
          <form action={closeSupportTicketFormAction}>
            <input name="ticketId" type="hidden" value={ticket.id} />
            <button
              className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300"
              type="submit"
            >
              Close
            </button>
          </form>
        )}
      </ActionToolbar>
    </div>
  );
}

async function replySupportTicketFormAction(formData: FormData) {
  "use server";

  await replySupportTicketAction(formData);
}

async function reopenSupportTicketFormAction(formData: FormData) {
  "use server";

  await reopenSupportTicketAction(formData);
}

async function closeSupportTicketFormAction(formData: FormData) {
  "use server";

  await closeSupportTicketAction(formData);
}

async function getSupportTicketRows(): Promise<
  { kind: "ready"; rows: SupportTicketRow[] } | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(supportTicketsSchema)
      .orderBy(desc(supportTicketsSchema.updatedAt));

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
        user: row.userName,
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
