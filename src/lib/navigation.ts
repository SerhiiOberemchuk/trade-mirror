import type { Route } from "next";

type NavItem = {
  label: string;
  href: Route;
  symbol?: string;
};

export const publicNavItems = [
  { label: "Markets", href: "/markets" },
  { label: "Top Traders", href: "/top-traders" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Guide", href: "/guide" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "FAQ", href: "/faq" },
] as const satisfies readonly NavItem[];

export const dashboardNavItems = [
  { label: "Overview", href: "/dashboard", symbol: "OV" },
  { label: "Terminal", href: "/terminal", symbol: "TX" },
  { label: "Copy Trading", href: "/copy-trading", symbol: "CP" },
  { label: "Marketplace", href: "/trader-marketplace", symbol: "MP" },
  { label: "Trader Profile", href: "/trader-profile", symbol: "PF" },
  { label: "Wallet", href: "/wallet", symbol: "WL" },
  { label: "History", href: "/history", symbol: "HS" },
  { label: "Verification", href: "/verification", symbol: "KY" },
  { label: "Support", href: "/support", symbol: "SP" },
  { label: "Settings", href: "/settings", symbol: "ST" },
] as const satisfies readonly NavItem[];

export const adminNavItems = [
  { label: "Admin Overview", href: "/admin", symbol: "AO" },
  { label: "Users", href: "/admin/users", symbol: "US" },
  { label: "Trading Pairs", href: "/admin/trading-pairs", symbol: "TP" },
  { label: "Deposits", href: "/admin/deposits", symbol: "DP" },
  { label: "Withdrawals", href: "/admin/withdrawals", symbol: "WD" },
  { label: "KYC Review", href: "/admin/kyc", symbol: "KY" },
  { label: "Bonuses", href: "/admin/bonuses", symbol: "BN" },
  { label: "Trades", href: "/admin/trades", symbol: "TR" },
  { label: "Copy Trading", href: "/admin/copy-trading", symbol: "CT" },
  { label: "Referrals", href: "/admin/referrals", symbol: "RF" },
  { label: "Support", href: "/admin/support", symbol: "SP" },
  { label: "Settings", href: "/admin/settings", symbol: "ST" },
] as const satisfies readonly NavItem[];
