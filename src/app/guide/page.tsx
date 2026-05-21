import type { Metadata } from "next";
import Link from "next/link";
import { InfoCard, PageHero, PublicShell, SectionHeader } from "@/components/public-shell";
import {
  adminCapabilities,
  boundaryRows,
  userFlowSteps,
  workspaceAreas,
} from "./guide-content";
import { PlatformMap, SystemDiagram } from "./visual-panels";

export const metadata: Metadata = {
  title: "TradeMirror Guide | What The Platform Does",
  description:
    "A practical user guide for TradeMirror: what is real, what is simulated, and how to use the trading, copy trading, wallet, verification, and support flows.",
};

export default function GuidePage() {
  return (
    <PublicShell>
      <PageHero
        description="A practical guide to TradeMirror: what the platform is for, which data is real, what stays simulated, and how a user should move through the product."
        eyebrow="User guide"
        title="Understand the platform before you trade the demo"
      >
        <PlatformMap />
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <article className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="TradeMirror is built to feel like a real FinTech product while keeping financial operations safely simulated."
            title="Project Purpose"
          />
          <div className="space-y-5 p-5 text-sm leading-6 text-muted">
            <p>
              TradeMirror is a crypto copy trading simulation platform. It lets a user
              practice trading workflows, publish a trader profile, copy simulated
              activity from other profiles, and review the whole process from user and
              admin dashboards.
            </p>
            <p>
              The platform is useful for testing product flows, portfolio-grade
              dashboards, admin operations, and trading UX without touching real money.
              Real market movement gives the simulation realistic context, while every
              user balance and financial action remains demo-only.
            </p>
          </div>
        </article>

        <article className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="This boundary must stay visible in the UI and in the code."
            title="Real Data vs Simulation"
          />
          <div className="grid gap-3 p-5">
            {boundaryRows.map(([title, description]) => (
              <div
                className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[180px_1fr]"
                key={title}
              >
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
        <article className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="The shortest path from a new visitor to a working demo trading setup."
            title="Recommended User Path"
          />
          <div className="grid gap-4 p-5 lg:grid-cols-4">
            {userFlowSteps.map((item) => (
              <div
                className="relative overflow-hidden rounded-lg border border-border bg-background p-5"
                key={item.step}
              >
                <div className="absolute right-4 top-4 font-mono text-4xl font-semibold text-primary/10">
                  {item.step}
                </div>
                <p className="font-mono text-xs font-semibold text-primary">{item.step}</p>
                <h2 className="mt-5 text-base font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <article className="rounded-lg border border-border bg-card">
          <SectionHeader
            description="Each workspace page has one clear job. The product should feel like a compact operating system, not a pile of screens."
            title="Workspace Areas"
          />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {workspaceAreas.map(([title, description]) => (
              <InfoCard description={description} key={title} title={title} />
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-lg border border-border bg-card">
            <SectionHeader
              description="A compact view of how the platform thinks about data."
              title="System Model"
            />
            <SystemDiagram />
          </article>

          <article className="rounded-lg border border-border bg-card">
            <SectionHeader
              description="Admin exists to operate the demo platform and verify workflows."
              title="Admin Role"
            />
            <div className="space-y-3 p-5">
              {adminCapabilities.map((item) => (
                <div
                  className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-primary/30 bg-primary/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-lg font-semibold">Ready to try the product flow?</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Start with a demo account, then open the terminal, wallet, marketplace,
              and dashboard in that order. Every financial action stays simulated.
            </p>
          </div>
          <Link
            className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 outline-none transition duration-150 hover:bg-cyan-300 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30"
            href="/register"
          >
            Open demo account
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
