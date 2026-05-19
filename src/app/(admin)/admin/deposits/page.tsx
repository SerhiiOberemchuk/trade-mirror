import { adminDeposits } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminDepositsPage() {
  return (
    <>
      <AdminPageHeader
        description="Deposit simulation records for reviewing financial operations UI before backend state exists."
        title="Deposits"
      />
      <AdminCard description="Incoming demo funds" title="Deposit records">
        <FinanceRows rows={adminDeposits} />
      </AdminCard>
    </>
  );
}

function FinanceRows({
  rows,
}: {
  rows: readonly { user: string; amount: string; method: string; status: string; date: string }[];
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div className="grid gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-5" key={`${row.user}-${row.date}`}>
          <p className="font-medium">{row.user}</p>
          <p className="font-mono">{row.amount}</p>
          <p className="text-muted">{row.method}</p>
          <p className="text-warning">{row.status}</p>
          <p className="text-muted md:text-right">{row.date}</p>
        </div>
      ))}
    </div>
  );
}
