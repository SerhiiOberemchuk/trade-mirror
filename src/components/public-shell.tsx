import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { NavLinkItem } from "@/components/nav-link";
import { publicNavItems, routes } from "@/lib/routes";

type PublicShellProps = {
  children: React.ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link
          className="flex items-center gap-3 rounded-lg outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/30"
          href={routes.home}
        >
          <div className="grid size-9 place-items-center overflow-hidden rounded-lg border border-primary/40 bg-primary/10">
            <BrandMark />
          </div>
          <div>
            <p className="text-sm font-semibold leading-5">TradeMirror</p>
            <p className="text-xs leading-4 text-muted">Simulation platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-lg border border-border bg-card/60 p-1 xl:flex">
          {publicNavItems.map((item) => (
            <NavLinkItem
              href={item.href}
              key={item.href}
              label={item.label}
              mode="public"
            />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted outline-none transition duration-150 hover:border-primary/50 hover:text-foreground active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30 sm:inline-flex"
            href={routes.login}
          >
            Log in
          </Link>
          <Link
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 outline-none transition duration-150 hover:bg-cyan-300 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/30"
            href={routes.register}
          >
            Open demo
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between lg:px-8">
        <p>TradeMirror is a simulated trading product. No real financial operations.</p>
        <div className="flex flex-wrap gap-4">
          {publicNavItems.slice(0, 4).map((item) => (
            <Link
              className="rounded-md outline-none transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(5,8,22,0)_42%)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-12">
        <div className="space-y-5">
          <div className="inline-flex rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            {eyebrow}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
              {description}
            </p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

type SectionHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

type InfoCardProps = {
  title: string;
  description: string;
};

export function InfoCard({ title, description }: InfoCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
