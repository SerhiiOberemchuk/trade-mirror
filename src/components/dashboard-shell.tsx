import Link from "next/link";
import { NavLinkItem } from "@/components/nav-link";
import { dashboardNavItems, routes } from "@/lib/routes";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border bg-surface lg:block">
          <div className="flex h-16 items-center gap-3 border-b border-border px-5">
            <Link
              className="grid size-9 place-items-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-sm font-semibold text-primary outline-none transition duration-150 hover:bg-primary/15 focus-visible:ring-2 focus-visible:ring-primary/30"
              href={routes.home}
            >
              TM
            </Link>
            <div>
              <p className="text-sm font-semibold leading-5">TradeMirror</p>
              <p className="text-xs text-muted">User workspace</p>
            </div>
          </div>

          <nav className="space-y-1 p-3">
            {dashboardNavItems.map((item) => (
              <NavLinkItem
                href={item.href}
                key={item.href}
                label={item.label}
                mode="sidebar"
                symbol={item.symbol}
              />
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <Topbar />
          <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95">
      <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
        <div className="min-w-0 flex-1">
          <label className="block max-w-md">
            <span className="sr-only">Search</span>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              placeholder="Search pairs, traders, tickets"
            />
          </label>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
            <p className="font-mono text-sm font-semibold">$125,420.80</p>
            <p className="text-xs text-muted">Demo balance</p>
          </div>
          <button className="grid size-10 place-items-center rounded-lg border border-border bg-card text-sm text-muted outline-none transition duration-150 hover:border-primary/50 hover:text-foreground active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30">
            NT
          </button>
          <div className="grid size-10 place-items-center rounded-lg bg-primary font-semibold text-slate-950">
            MQ
          </div>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-border px-5 py-2 lg:hidden">
        {dashboardNavItems.map((item) => (
          <NavLinkItem
            href={item.href}
            key={item.href}
            label={item.label}
            mode="mobile"
          />
        ))}
      </nav>
    </header>
  );
}

type DashboardPageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function DashboardPageHeader({
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DashboardCard({ title, description, children }: DashboardCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

type StatTileProps = {
  label: string;
  value: string;
  change?: string;
};

export function StatTile({ label, value, change }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
      {change ? <p className="mt-1 text-xs text-primary">{change}</p> : null}
    </div>
  );
}
