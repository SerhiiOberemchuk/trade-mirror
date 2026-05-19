export const adminStats = [
  { label: "Total users", value: "18,420", change: "+8.2%" },
  { label: "Active traders", value: "1,284", change: "+126 this week" },
  { label: "Open tickets", value: "42", change: "9 high priority" },
  { label: "Pending withdrawals", value: "$84,200", change: "18 requests" },
] as const;

export const adminUsers = [
  { name: "Mira Quant", email: "mira@example.com", role: "Trader", balance: "$125,420", status: "Active" },
  { name: "Alex Copy", email: "alex@example.com", role: "User", balance: "$42,180", status: "Active" },
  { name: "North Signal", email: "north@example.com", role: "Trader", balance: "$98,700", status: "Review" },
  { name: "Iryna Ops", email: "iryna@example.com", role: "Admin", balance: "$0", status: "Active" },
] as const;

export const adminPairs = [
  { pair: "BTC/USDT", status: "Enabled", spread: "0.02%", leverage: "10x", volume: "$18.2B" },
  { pair: "ETH/USDT", status: "Enabled", spread: "0.03%", leverage: "10x", volume: "$9.7B" },
  { pair: "SOL/USDT", status: "Enabled", spread: "0.04%", leverage: "5x", volume: "$2.4B" },
  { pair: "ADA/USDT", status: "Paused", spread: "0.06%", leverage: "3x", volume: "$640M" },
] as const;

export const adminDeposits = [
  { user: "Alex Copy", amount: "$5,000", method: "Demo card", status: "Completed", date: "May 18, 2026" },
  { user: "Mira Quant", amount: "$20,000", method: "Demo wire", status: "Completed", date: "May 17, 2026" },
  { user: "Delta Vega", amount: "$8,500", method: "Bonus credit", status: "Review", date: "May 17, 2026" },
] as const;

export const adminWithdrawals = [
  { user: "Alex Copy", amount: "$2,500", risk: "Low", status: "Pending", date: "May 18, 2026" },
  { user: "North Signal", amount: "$12,000", risk: "Medium", status: "Pending", date: "May 18, 2026" },
  { user: "Apex Ledger", amount: "$4,800", risk: "High", status: "Review", date: "May 17, 2026" },
] as const;

export const adminBonuses = [
  { name: "First deposit boost", value: "25%", status: "Enabled", usage: "1,248 users" },
  { name: "Second deposit boost", value: "15%", status: "Enabled", usage: "420 users" },
  { name: "Trader launch promo", value: "$1,000", status: "Paused", usage: "88 users" },
] as const;

export const adminTrades = [
  { id: "TR-1042", user: "Mira Quant", pair: "BTC/USDT", side: "Long", size: "$12,500", pnl: "+$642" },
  { id: "TR-1041", user: "Alex Copy", pair: "ETH/USDT", side: "Long", size: "$4,200", pnl: "+$88" },
  { id: "TR-1040", user: "North Signal", pair: "SOL/USDT", side: "Short", size: "$7,700", pnl: "-$214" },
] as const;

export const adminCopyActivity = [
  { leader: "Mira Quant", follower: "Alex Copy", ratio: "40%", allocation: "$8,200", status: "Active" },
  { leader: "Delta Vega", follower: "Apex Ledger", ratio: "25%", allocation: "$4,500", status: "Paused" },
  { leader: "North Signal", follower: "Sofia Demo", ratio: "15%", allocation: "$2,100", status: "Active" },
] as const;

export const adminReferrals = [
  { referrer: "Mira Quant", signups: "128", active: "84", reward: "$2,420" },
  { referrer: "Delta Vega", signups: "92", active: "61", reward: "$1,740" },
  { referrer: "Apex Ledger", signups: "48", active: "22", reward: "$720" },
] as const;

export const adminSupportTickets = [
  { subject: "Withdrawal review", user: "Apex Ledger", priority: "High", status: "Open", updated: "8 min ago" },
  { subject: "KYC rejection question", user: "North Signal", priority: "Medium", status: "Open", updated: "42 min ago" },
  { subject: "Bonus not visible", user: "Alex Copy", priority: "Low", status: "Answered", updated: "2h ago" },
] as const;

export const adminSettings = [
  { section: "Platform", rows: ["Maintenance mode", "Public registration", "Default demo balance"] },
  { section: "Trading", rows: ["Pair availability", "Max leverage", "Risk limits"] },
  { section: "Operations", rows: ["Withdrawal review SLA", "Bonus approvals", "Support routing"] },
] as const;
