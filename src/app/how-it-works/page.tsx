import { InfoCard, PageHero, PublicShell } from "@/components/public-shell";

const steps = [
  ["1", "Choose a trader", "Review strategy, risk level, followers, drawdown, and simulated trade history."],
  ["2", "Set copy rules", "Define copy ratio, allocation limits, stop loss, take profit, and allowed pairs."],
  ["3", "Mirror activity", "TradeMirror creates simulated copied positions when the selected trader opens activity."],
  ["4", "Monitor risk", "Track PnL, exposure, wallet impact, and closed positions from one dashboard."],
] as const;

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <PageHero
        description="A simple mental model for copy trading before implementation begins: select, configure, mirror, and monitor."
        eyebrow="Copy trading flow"
        title="How simulated copy trading works"
      >
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-4">
            {steps.slice(0, 3).map(([number, title]) => (
              <div className="flex items-center gap-3" key={number}>
                <div className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-slate-950">
                  {number}
                </div>
                <p className="text-sm font-medium">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:grid-cols-2 lg:px-8">
        {steps.map(([number, title, description]) => (
          <InfoCard description={`${number}. ${description}`} key={title} title={title} />
        ))}
      </section>
    </PublicShell>
  );
}
