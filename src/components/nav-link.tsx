"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavTone = "primary" | "warning";
type NavMode = "public" | "sidebar" | "mobile";

type NavLinkItemProps = {
  href: string;
  label: string;
  mode: NavMode;
  symbol?: string;
  tone?: NavTone;
};

export function NavLinkItem({
  href,
  label,
  mode,
  symbol,
  tone = "primary",
}: NavLinkItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const toneClasses = getToneClasses(tone);

  if (mode === "sidebar") {
    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm outline-none transition duration-150 focus-visible:ring-2 ${toneClasses.ringClass} ${
          isActive
            ? `${toneClasses.activeBg} ${toneClasses.activeText} ${toneClasses.activeBorder}`
            : "border-transparent text-muted hover:border-border hover:bg-white/5 hover:text-foreground"
        }`}
        href={href}
      >
        {symbol ? (
          <span
            className={`grid size-7 place-items-center rounded-md border bg-background font-mono text-[10px] transition duration-150 group-hover:translate-x-0.5 ${
              isActive
                ? `${toneClasses.symbolBorder} ${toneClasses.symbolText}`
                : `border-border ${toneClasses.idleSymbolText}`
            }`}
          >
            {symbol}
          </span>
        ) : null}
        <span className="transition duration-150 group-hover:translate-x-0.5">
          {label}
        </span>
      </Link>
    );
  }

  if (mode === "mobile") {
    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`shrink-0 rounded-lg border px-3 py-2 text-xs outline-none transition-colors duration-150 focus-visible:ring-2 ${toneClasses.ringClass} ${
          isActive
            ? `${toneClasses.activeBg} ${toneClasses.activeText} ${toneClasses.activeBorder}`
            : "border-border bg-card text-muted hover:bg-white/5 hover:text-foreground"
        }`}
        href={href}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={`rounded-md border px-3 py-2 text-sm outline-none transition-colors duration-150 focus-visible:ring-2 ${toneClasses.ringClass} ${
        isActive
          ? `${toneClasses.activeBg} ${toneClasses.activeText} ${toneClasses.activeBorder}`
          : "border-transparent text-muted hover:bg-white/5 hover:text-foreground"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

function getToneClasses(tone: NavTone) {
  if (tone === "warning") {
    return {
      activeBg: "bg-warning/10",
      activeText: "text-foreground",
      activeBorder: "border-warning/40",
      symbolBorder: "border-warning/40",
      symbolText: "text-warning",
      idleSymbolText: "text-warning",
      ringClass: "focus-visible:ring-warning/30",
    };
  }

  return {
    activeBg: "bg-primary/10",
    activeText: "text-foreground",
    activeBorder: "border-primary/40",
    symbolBorder: "border-primary/40",
    symbolText: "text-primary",
    idleSymbolText: "text-primary",
    ringClass: "focus-visible:ring-primary/30",
  };
}
