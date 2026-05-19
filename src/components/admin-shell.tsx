import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { NavLinkItem } from "@/components/nav-link";
import { adminNavItems } from "@/lib/navigation";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-border bg-surface lg:block">
          <div className="flex h-16 items-center gap-3 border-b border-border px-5">
            <Link
              className="grid size-9 place-items-center overflow-hidden rounded-lg border border-warning/40 bg-warning/10 outline-none transition duration-150 hover:bg-warning/15 focus-visible:ring-2 focus-visible:ring-warning/30"
              href="/"
            >
              <BrandMark alt="TradeMirror" />
            </Link>
            <div>
              <p className="text-sm font-semibold leading-5">TradeMirror Admin</p>
              <p className="text-xs text-muted">Operations workspace</p>
            </div>
          </div>

          <nav className="space-y-1 p-3">
            {adminNavItems.map((item) => (
              <NavLinkItem
                href={item.href}
                key={item.href}
                label={item.label}
                mode="sidebar"
                symbol={item.symbol}
                tone="warning"
              />
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <AdminTopbar />
          <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

function AdminTopbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95">
      <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Admin search</span>
          <input
            className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-warning/50 focus:ring-2 focus:ring-warning/20"
            placeholder="Search users, trades, requests"
          />
        </label>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
            <p className="font-mono text-sm font-semibold">42</p>
            <p className="text-xs text-muted">Open reviews</p>
          </div>
          <button className="grid size-10 place-items-center rounded-lg border border-border bg-card text-sm text-muted outline-none transition duration-150 hover:border-warning/50 hover:text-foreground active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-warning/30">
            AL
          </button>
          <div className="grid size-10 place-items-center rounded-lg bg-warning font-semibold text-slate-950">
            AD
          </div>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-border px-5 py-2 lg:hidden">
        {adminNavItems.map((item) => (
          <NavLinkItem
            href={item.href}
            key={item.href}
            label={item.label}
            mode="mobile"
            tone="warning"
          />
        ))}
      </nav>
    </header>
  );
}

type AdminPageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
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

type AdminCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminCard({ title, description, children }: AdminCardProps) {
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

export function AdminStatTile({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
      {change ? <p className="mt-1 text-xs text-warning">{change}</p> : null}
    </div>
  );
}

export function ReviewActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-md bg-success px-3 py-1.5 text-xs font-semibold text-slate-950 transition duration-150 hover:bg-emerald-300 active:scale-[0.99]">
        Approve
      </button>
      <button className="rounded-md bg-danger px-3 py-1.5 text-xs font-semibold text-white transition duration-150 hover:bg-red-400 active:scale-[0.99]">
        Reject
      </button>
      <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted transition duration-150 hover:border-warning/50 hover:text-foreground active:scale-[0.99]">
        Review
      </button>
    </div>
  );
}
