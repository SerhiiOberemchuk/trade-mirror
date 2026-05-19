import { adminTrades } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminTradesPage() {
  return (
    <>
      <AdminPageHeader
        description="Platform-level trade monitor for simulated manual and copied positions."
        title="Trades History"
      />

      <AdminCard description="Recent trade activity" title="Trades">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-border">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Pair</th>
                <th className="pb-3 font-medium">Side</th>
                <th className="pb-3 font-medium">Size</th>
                <th className="pb-3 font-medium">PnL</th>
              </tr>
            </thead>
            <tbody>
              {adminTrades.map((trade) => (
                <tr className="border-b border-border/70 last:border-0" key={trade.id}>
                  <td className="py-3 font-mono text-muted">{trade.id}</td>
                  <td className="py-3 font-medium">{trade.user}</td>
                  <td className="py-3">{trade.pair}</td>
                  <td className="py-3 text-muted">{trade.side}</td>
                  <td className="py-3 font-mono">{trade.size}</td>
                  <td className={trade.pnl.startsWith("+") ? "py-3 font-mono text-success" : "py-3 font-mono text-danger"}>{trade.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </>
  );
}
