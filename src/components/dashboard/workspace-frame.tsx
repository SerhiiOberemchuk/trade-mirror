"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
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

type WorkspaceSwitchLink = {
  href: Route;
  label: string;
};

type WorkspaceFrameProps = {
  balanceLabel: string;
  balanceValue: string;
  brandSubtitle: string;
  brandTitle: string;
  children: React.ReactNode;
  navItems: readonly NavItem[];
  notificationHref: Route;
  unreadNotifications: number;
  searchLabel: string;
  searchPlaceholder: string;
  switchLink?: WorkspaceSwitchLink;
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
  notificationHref,
  unreadNotifications,
  searchLabel,
  searchPlaceholder,
  switchLink,
  tone = "primary",
  user,
}: WorkspaceFrameProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveUnreadNotifications, setLiveUnreadNotifications] = useState(unreadNotifications);
  const previousUnreadCount = useRef(unreadNotifications);
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

  useEffect(() => {
    let isMounted = true;

    async function refreshUnreadCount() {
      try {
        const response = await fetch("/api/notifications/unread", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json() as { unreadCount?: number };
        const nextCount = Number(payload.unreadCount ?? 0);

        if (isMounted && Number.isFinite(nextCount)) {
          setLiveUnreadNotifications(nextCount);
        }
      } catch {
      }
    }

    const interval = window.setInterval(refreshUnreadCount, 15_000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled) {
      previousUnreadCount.current = liveUnreadNotifications;
      return;
    }

    if (liveUnreadNotifications > previousUnreadCount.current) {
      playNotificationSound();
    }

    previousUnreadCount.current = liveUnreadNotifications;
  }, [soundEnabled, liveUnreadNotifications]);

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
                <div className="flex items-center gap-2">
                  <Link
                    aria-label={
                      liveUnreadNotifications > 0
                        ? `${liveUnreadNotifications} unread notifications`
                        : "Notifications"
                    }
                    className={`relative rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
                    href={notificationHref}
                  >
                    Updates
                    {liveUnreadNotifications > 0 ? (
                      <span className="ml-2 rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-white">
                        {formatUnreadCount(liveUnreadNotifications)}
                      </span>
                    ) : null}
                  </Link>
                  <button
                    aria-pressed={soundEnabled}
                    className={`rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium outline-none transition duration-150 focus-visible:ring-2 ${accent.focusRing} ${
                      soundEnabled
                        ? "text-foreground"
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                    onClick={() => {
                      const nextEnabled = !soundEnabled;
                      setSoundEnabled(nextEnabled);

                      if (nextEnabled && liveUnreadNotifications > 0) {
                        playNotificationSound();
                      }
                    }}
                    type="button"
                  >
                    Sound {soundEnabled ? "on" : "off"}
                  </button>
                </div>
                {switchLink ? (
                  <Link
                    className={`rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
                    href={switchLink.href}
                  >
                    {switchLink.label}
                  </Link>
                ) : null}
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
                  <Link
                    className={`mb-3 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
                    href={notificationHref}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <span>Updates</span>
                    {liveUnreadNotifications > 0 ? (
                      <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-white">
                        {formatUnreadCount(liveUnreadNotifications)}
                      </span>
                    ) : null}
                  </Link>
                  {switchLink ? (
                    <Link
                      className={`mb-3 block rounded-lg border border-border bg-card px-3 py-2 text-center text-sm font-medium text-muted outline-none transition duration-150 hover:bg-white/5 hover:text-foreground focus-visible:ring-2 ${accent.focusRing}`}
                      href={switchLink.href}
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      {switchLink.label}
                    </Link>
                  ) : null}
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

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

function playNotificationSound() {
  const AudioContext =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof window.AudioContext })
      .webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
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
