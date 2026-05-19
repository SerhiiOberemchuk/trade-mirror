import { InfoCard, PageHero, PublicShell } from "@/components/public-shell";

const securityItems = [
  ["Simulation boundary", "Deposits, withdrawals, balances, and trades are labeled as simulated product behavior."],
  ["Role-based access", "Guest, user, trader, and admin surfaces are separated in planned route and permission structure."],
  ["Verification flow", "Mock KYC states can preview document upload, review, approval, and rejection workflows."],
  ["Operational audit", "Admin views will expose user activity, support tickets, copy activity, and balance changes."],
] as const;

export default function SecurityPage() {
  return (
    <PublicShell>
      <PageHero
        description="Security pages should communicate clear product boundaries and planned control surfaces without pretending the simulation handles real funds."
        eyebrow="Trust and controls"
        title="Security model for a simulated trading platform"
      >
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="grid gap-3">
            {["Protected routes", "Session management", "Admin approvals"].map((item) => (
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:grid-cols-2 lg:px-8">
        {securityItems.map(([title, description]) => (
          <InfoCard description={description} key={title} title={title} />
        ))}
      </section>
    </PublicShell>
  );
}
