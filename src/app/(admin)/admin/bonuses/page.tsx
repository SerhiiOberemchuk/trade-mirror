import { adminBonuses } from "@/data/admin";
import { AdminCard, AdminPageHeader } from "@/components/admin-shell";

export default function AdminBonusesPage() {
  return (
    <>
      <AdminPageHeader
        action={<button className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-slate-950">New bonus</button>}
        description="Promotion toggles and bonus campaign performance for the simulated platform."
        title="Bonuses"
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {adminBonuses.map((bonus) => (
          <AdminCard description={bonus.usage} key={bonus.name} title={bonus.name}>
            <p className="font-mono text-3xl font-semibold">{bonus.value}</p>
            <p className="mt-2 text-sm text-warning">{bonus.status}</p>
            <button className="mt-5 w-full rounded-lg border border-border px-4 py-2 text-sm text-muted">
              Configure
            </button>
          </AdminCard>
        ))}
      </section>
    </>
  );
}
