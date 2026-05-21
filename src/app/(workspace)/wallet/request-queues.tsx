import {
  DashboardCard,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard-shell";
import type {
  DepositRequestState,
  WithdrawalRequestRow,
  WithdrawalRequestState,
} from "@/server/wallet/requests";

export function WalletRequestQueues({
  depositState,
  withdrawalState,
}: {
  depositState: DepositRequestState;
  withdrawalState: WithdrawalRequestState;
}) {
  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <DashboardCard
        description="Your persisted simulated deposit requests"
        title="Deposit review queue"
      >
        <DepositRequestQueue state={depositState} />
      </DashboardCard>

      <DashboardCard
        description="Your persisted simulated withdrawal requests"
        title="Withdrawal review queue"
      >
        <WithdrawalRequestQueue state={withdrawalState} />
      </DashboardCard>
    </section>
  );
}

function DepositRequestQueue({ state }: { state: DepositRequestState }) {
  if (state.kind === "setup-required") {
    return (
      <EmptyState
        description="The deposit table is not available yet. Apply the generated Drizzle migration before creating requests."
        title="Deposit requests are not ready"
      />
    );
  }

  if (state.rows.length === 0) {
    return (
      <EmptyState
        description="Submit a request above and it will appear in the admin deposit queue."
        title="No deposit requests yet"
      />
    );
  }

  return (
    <div className="space-y-3">
      {state.rows.map((request) => (
        <div
          className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[1fr_120px_120px_140px]"
          key={request.id}
        >
          <p className="font-mono">{request.amount}</p>
          <p className="text-muted">{request.method}</p>
          <StatusBadge tone={getStatusTone(request.status)}>
            {request.status}
          </StatusBadge>
          <p className="text-muted md:text-right">{request.date}</p>
        </div>
      ))}
    </div>
  );
}

function WithdrawalRequestQueue({ state }: { state: WithdrawalRequestState }) {
  if (state.kind === "setup-required") {
    return (
      <EmptyState
        description="The withdrawal table is not available yet. Apply the generated Drizzle migration before creating requests."
        title="Withdrawal requests are not ready"
      />
    );
  }

  if (state.rows.length === 0) {
    return (
      <EmptyState
        description="Submit a request above and it will appear in the admin withdrawal queue."
        title="No withdrawal requests yet"
      />
    );
  }

  return (
    <div className="space-y-3">
      {state.rows.map((request) => (
        <div
          className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-[1fr_120px_120px_140px]"
          key={request.id}
        >
          <p className="font-mono">{request.amount}</p>
          <StatusBadge tone={getRiskTone(request.risk)}>
            {request.risk}
          </StatusBadge>
          <StatusBadge tone={getStatusTone(request.status)}>
            {request.status}
          </StatusBadge>
          <p className="text-muted md:text-right">{request.date}</p>
        </div>
      ))}
    </div>
  );
}

function getRiskTone(risk: WithdrawalRequestRow["risk"]) {
  if (risk === "high") {
    return "danger";
  }

  if (risk === "medium") {
    return "warning";
  }

  return "success";
}

function getStatusTone(status: WithdrawalRequestRow["status"]) {
  if (status === "approved") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}
