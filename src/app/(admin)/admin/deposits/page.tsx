import { db } from "@/db";
import { depositRequests } from "@/db/schema";
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
  approveDepositAction,
  rejectDepositAction,
} from "./actions";

type DepositRow = {
  id: string;
  user: string;
  amount: string;
  method: string;
  status: "pending" | "approved" | "rejected";
  date: string;
};

const depositColumns = [
  {
    header: "User",
    cell: (request) => <span className="font-medium">{request.user}</span>,
  },
  {
    header: "Amount",
    cell: (request) => <span className="font-mono">{request.amount}</span>,
  },
  {
    header: "Method",
    cell: (request) => <span className="text-muted">{request.method}</span>,
  },
  {
    header: "Status",
    cell: (request) => <StatusBadge tone={getStatusTone(request.status)}>{request.status}</StatusBadge>,
  },
  {
    header: "Requested",
    cell: (request) => <span className="font-mono text-muted">{request.date}</span>,
  },
  {
    header: "Actions",
    cell: (request) => <DepositActions request={request} />,
  },
] as const satisfies readonly DataTableColumn<DepositRow>[];

export default async function AdminDepositsPage() {
  const state = await getDepositRows();

  return (
    <>
      <AdminPageHeader
        description="Simulated deposit review with persisted approve and reject decisions."
        title="Deposits"
      />
      <AdminCard description="Incoming simulated funds" title="Deposit approvals">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={depositColumns}
            getRowKey={(request) => request.id}
            minWidth="920px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Deposit requests will appear here after simulated users submit them."
            title="No deposit requests"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted deposit approvals."
            title="Deposit table is not ready"
          />
        ) : null}
      </AdminCard>
    </>
  );
}

function DepositActions({ request }: { request: DepositRow }) {
  if (request.status !== "pending") {
    return <span className="text-xs text-muted">Reviewed</span>;
  }

  return (
    <ActionToolbar>
      <form action={approveDepositAction}>
        <input name="depositId" type="hidden" value={request.id} />
        <button className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300" type="submit">
          Approve
        </button>
      </form>
      <form action={rejectDepositAction}>
        <input name="depositId" type="hidden" value={request.id} />
        <button className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400" type="submit">
          Reject
        </button>
      </form>
    </ActionToolbar>
  );
}

async function getDepositRows(): Promise<
  | { kind: "ready"; rows: DepositRow[] }
  | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(depositRequests)
      .orderBy(desc(depositRequests.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        user: row.userName,
        amount: formatMoney(row.amountCents, row.currency),
        method: row.method,
        status: row.status,
        date: formatDate(row.requestedAt),
      })),
    };
  } catch {
    return { kind: "setup-required" };
  }
}

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    currency,
    style: "currency",
  }).format(amountCents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusTone(status: DepositRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
