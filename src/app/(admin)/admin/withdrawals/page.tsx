import { adminWithdrawals } from "@/data/admin";
import { AdminCard, AdminPageHeader, ReviewActions } from "@/components/admin-shell";

export default function AdminWithdrawalsPage() {
  return (
    <>
      <AdminPageHeader
        description="Withdrawal request review surface with static approve, reject, and review controls."
        title="Withdrawals"
      />
      <AdminCard description="Pending simulated withdrawals" title="Withdrawal approvals">
        <div className="space-y-3">
          {adminWithdrawals.map((request) => (
            <div className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm lg:grid-cols-[1fr_120px_120px_120px_220px]" key={`${request.user}-${request.date}`}>
              <p className="font-medium">{request.user}</p>
              <p className="font-mono">{request.amount}</p>
              <p className="text-muted">{request.risk}</p>
              <p className="text-warning">{request.status}</p>
              <ReviewActions />
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
