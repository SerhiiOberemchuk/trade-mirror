import { pricingPlans } from "@/data/marketing";
import { PageHero, PublicShell } from "@/components/public-shell";

export default function PricingPage() {
  return (
    <PublicShell>
      <PageHero
        description="Pricing is part of the SaaS presentation layer for portfolio review. Plans are placeholders until real billing scope is discussed."
        eyebrow="SaaS packaging"
        title="Plans for demo trading workflows"
      >
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted">No real payments are processed in this simulation.</p>
          <p className="mt-3 font-mono text-3xl font-semibold">$0 - $79</p>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-3 lg:px-8">
        {pricingPlans.map((plan) => (
          <article className="rounded-lg border border-border bg-card p-5" key={plan.name}>
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{plan.description}</p>
            <p className="mt-6 font-mono text-4xl font-semibold">{plan.price}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted">per month preview</p>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div className="rounded-lg border border-border bg-background px-3 py-3 text-sm" key={feature}>
                  {feature}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </PublicShell>
  );
}
