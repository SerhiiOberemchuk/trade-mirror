import { verificationSteps } from "@/data/dashboard";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard-shell";

export default function VerificationPage() {
  return (
    <>
      <DashboardPageHeader
        description="Mock KYC flow for reviewing user-side verification states before upload and admin logic is added."
        title="Verification"
      />

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardCard description="Current onboarding status" title="Verification progress">
          <div className="space-y-3">
            {verificationSteps.map((step, index) => (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3" key={step.label}>
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 font-mono text-sm text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.label}</p>
                  <p className="text-sm text-muted">{step.status}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard description="Static upload surface preview" title="Document upload">
          <div className="grid gap-4 md:grid-cols-2">
            {["Identity document", "Address proof"].map((item) => (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center" key={item}>
                <p className="font-medium">{item}</p>
                <p className="mt-2 text-sm text-muted">Upload control placeholder</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </>
  );
}
