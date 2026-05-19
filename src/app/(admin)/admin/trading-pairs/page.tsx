import { adminPairs } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminTradingPairsPage() {
  return (
    <>
      <AdminPageHeader
        action={<button className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-slate-950">Add pair</button>}
        description="Pair availability, spread, leverage, and simulated volume controls."
        title="Trading Pairs"
      />

      <AdminCard description="Markets configured for the simulated terminal" title="Pair configuration">
        <div className="grid gap-3">
          {adminPairs.map((pair) => (
            <div className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm md:grid-cols-5" key={pair.pair}>
              <p className="font-semibold">{pair.pair}</p>
              <p className="text-warning">{pair.status}</p>
              <p className="font-mono text-muted">{pair.spread}</p>
              <p className="font-mono text-muted">{pair.leverage}</p>
              <p className="font-mono md:text-right">{pair.volume}</p>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
