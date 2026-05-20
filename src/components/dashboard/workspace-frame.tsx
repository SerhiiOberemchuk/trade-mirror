"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand-mark";
import { NavLinkItem } from "@/components/nav-link";

type ShellUser = {
  name: string;
  email: string;
  role?: string | string[] | null;
};

type NavItem = {
  label: string;
  href: Route;
  symbol?: string;
};

type WorkspaceFrameProps = {
  balanceLabel: string;
  balanceValue: string;
  brandSubtitle: string;
  brandTitle: string;
  children: React.ReactNode;
  navItems: readonly NavItem[];
  searchLabel: string;
  searchPlaceholder: string;
  tone?: "primary" | "warning";
  user: ShellUser;
};

export function WorkspaceFrame({
  balanceLabel,
  balanceValue,
  brandSubtitle,
  brandTitle,
  children,
  navItems,
  searchLabel,
  searchPlaceholder,
  tone = "primary",
  user,
}: WorkspaceFrameProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavId = useId();
  const initials = getInitials(user.name);
  const role = Array.isArray(user.role) ? user.role.join(", ") : user.role;
  const accent = getAccent(tone);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileNavOpen]);

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <div className={`grid h-screen ${isCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]"}`}>
        <aside className="hidden h-screen min-h-0 border-r border-border bg-surface lg:flex lg:flex-col">
          <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-border ${isCollapsed ? "justify-center px-3" : "px-5"}`}>
            <Link
              className={`grid size-9 place-items-center overflow-hidden rounded-lg border ${accent.logoBorder} ${accent.logoBg} outline-none transition duration-150 ${accent.logoHover} focus-visible:ring-2 ${accent.focusRing}`}
              href="/"
              title={brandTitle}
            >
              <BrandMark alt="TradeMirror" />
            </Link>
            {isCollapsed ? null : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5">{brandTitle}</p>
                <p className="truncate text-xs text-muted">{brandSubtitle}</p>
              </div>
            )}
            <button
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`grid size-8 place-items-center rounded-md border border-border text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
              onClick={() => setIsCollapsed((current) => !current)}
              type="button"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {isCollapsed ? "+" : "-"}
              </span>
            </button>
          </div>

          <nav aria-label={`${brandTitle} sidebar navigation`} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            {navItems.map((item) => (
              <NavLinkItem
                collapsed={isCollapsed}
                href={item.href}
                key={item.href}
                label={item.label}
                mode="sidebar"
                symbol={item.symbol}
                tone={tone}
              />
            ))}
          </nav>
        </aside>

        <section className="flex h-screen min-w-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-border bg-surface/95">
            <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-8">
              <button
                aria-controls={mobileNavId}
                aria-expanded={isMobileNavOpen}
                aria-label="Open navigation menu"
                className={`grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing} lg:hidden`}
                onClick={() => setIsMobileNavOpen(true)}
                type="button"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  =
                </span>
              </button>
              <label className="block min-w-0 flex-1">
                <span className="sr-only">{searchLabel}</span>
                <input
                  aria-label={searchLabel}
                  className={`w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted ${accent.inputFocus}`}
                  placeholder={searchPlaceholder}
                  type="search"
                />
              </label>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-right">
                  <p className="font-mono text-sm font-semibold">{balanceValue}</p>
                  <p className="text-xs text-muted">{balanceLabel}</p>
                </div>
                <SignOutButton tone={tone} />
                <div className={`grid size-10 place-items-center rounded-lg ${accent.avatarBg} font-semibold text-slate-950`}>
                  {initials}
                </div>
                <div className="max-w-44 truncate text-right">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted">{role ?? user.email}</p>
                </div>
              </div>
            </div>
          </header>

          {isMobileNavOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                aria-label="Close navigation menu"
                className="absolute inset-0 h-full w-full cursor-default bg-background/75"
                onClick={() => setIsMobileNavOpen(false)}
                type="button"
              />
              <div
                aria-modal="true"
                className="absolute left-0 top-0 flex h-full w-[min(320px,calc(100vw-32px))] flex-col border-r border-border bg-surface shadow-2xl shadow-black/40"
                id={mobileNavId}
                role="dialog"
              >
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
                  <Link
                    className={`grid size-9 place-items-center overflow-hidden rounded-lg border ${accent.logoBorder} ${accent.logoBg} outline-none transition duration-150 ${accent.logoHover} focus-visible:ring-2 ${accent.focusRing}`}
                    href="/"
                  >
                    <BrandMark alt="TradeMirror" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-5">{brandTitle}</p>
                    <p className="truncate text-xs text-muted">{brandSubtitle}</p>
                  </div>
                  <button
                    aria-label="Close navigation menu"
                    className={`grid size-9 place-items-center rounded-md border border-border text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
                    onClick={() => setIsMobileNavOpen(false)}
                    type="button"
                  >
                    <span aria-hidden="true" className="text-xl leading-none">
                      x
                    </span>
                  </button>
                </div>
                <nav aria-label={`${brandTitle} mobile navigation`} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                  {navItems.map((item) => (
                    <NavLinkItem
                      href={item.href}
                      key={item.href}
                      label={item.label}
                      mode="sidebar"
                      onNavigate={() => setIsMobileNavOpen(false)}
                      symbol={item.symbol}
                      tone={tone}
                    />
                  ))}
                </nav>
                <div className="border-t border-border p-4">
                  <div className="rounded-lg border border-border bg-card px-3 py-2">
                    <p className="font-mono text-sm font-semibold">{balanceValue}</p>
                    <p className="text-xs text-muted">{balanceLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAccent(tone: "primary" | "warning") {
  if (tone === "warning") {
    return {
      avatarBg: "bg-warning",
      focusRing: "focus-visible:ring-warning/30",
      inputFocus: "focus:border-warning/50 focus:ring-2 focus:ring-warning/20",
      logoBg: "bg-warning/10",
      logoBorder: "border-warning/40",
      logoHover: "hover:bg-warning/15",
    };
  }

  return {
    avatarBg: "bg-primary",
    focusRing: "focus-visible:ring-primary/30",
    inputFocus: "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
    logoBg: "bg-primary/10",
    logoBorder: "border-primary/40",
    logoHover: "hover:bg-primary/15",
  };
}
