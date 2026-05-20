import { db } from "@/db";
import { withdrawalRequests } from "@/db/schema";
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
  approveWithdrawalAction,
  rejectWithdrawalAction,
} from "./actions";

type WithdrawalRow = {
  id: string;
  user: string;
  amount: string;
  risk: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  date: string;
};

const withdrawalColumns = [
  {
    header: "User",
    cell: (request) => <span className="font-medium">{request.user}</span>,
  },
  {
    header: "Amount",
    cell: (request) => <span className="font-mono">{request.amount}</span>,
  },
  {
    header: "Risk",
    cell: (request) => <StatusBadge tone={getRiskTone(request.risk)}>{request.risk}</StatusBadge>,
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
    cell: (request) => <WithdrawalActions request={request} />,
  },
] as const satisfies readonly DataTableColumn<WithdrawalRow>[];

export default async function AdminWithdrawalsPage() {
  const state = await getWithdrawalRows();

  return (
    <>
      <AdminPageHeader
        description="Simulated withdrawal request review with persisted approve and reject decisions."
        title="Withdrawals"
      />
      <AdminCard description="Pending simulated withdrawals" title="Withdrawal approvals">
        {state.kind === "ready" && state.rows.length > 0 ? (
          <DataTable
            columns={withdrawalColumns}
            getRowKey={(request) => request.id}
            minWidth="920px"
            rows={state.rows}
          />
        ) : null}

        {state.kind === "ready" && state.rows.length === 0 ? (
          <EmptyState
            description="Withdrawal requests will appear here after simulated users submit them."
            title="No withdrawal requests"
          />
        ) : null}

        {state.kind === "setup-required" ? (
          <EmptyState
            description="Generate and apply the pending Drizzle migration before using persisted withdrawal approvals."
            title="Withdrawal table is not ready"
          />
        ) : null}
      </AdminCard>
    </>
  );
}

function WithdrawalActions({ request }: { request: WithdrawalRow }) {
  if (request.status !== "pending") {
    return <span className="text-xs text-muted">Reviewed</span>;
  }

  return (
    <ActionToolbar>
      <form action={approveWithdrawalAction}>
        <input name="withdrawalId" type="hidden" value={request.id} />
        <button className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300" type="submit">
          Approve
        </button>
      </form>
      <form action={rejectWithdrawalAction}>
        <input name="withdrawalId" type="hidden" value={request.id} />
        <button className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400" type="submit">
          Reject
        </button>
      </form>
    </ActionToolbar>
  );
}

async function getWithdrawalRows(): Promise<
  | { kind: "ready"; rows: WithdrawalRow[] }
  | { kind: "setup-required" }
> {
  try {
    const rows = await db
      .select()
      .from(withdrawalRequests)
      .orderBy(desc(withdrawalRequests.requestedAt));

    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        user: row.userName,
        amount: formatMoney(row.amountCents, row.currency),
        risk: row.riskLevel,
        status: row.status,
        date: new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(row.requestedAt),
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

function getRiskTone(risk: WithdrawalRow["risk"]) {
  if (risk === "high") {
    return "danger";
  }

  if (risk === "medium") {
    return "warning";
  }

  return "success";
}

function getStatusTone(status: WithdrawalRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
