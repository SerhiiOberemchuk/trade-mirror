export const dashboardStats = [
  { label: "Demo equity", value: "$125,420.80", change: "+8.6%" },
  { label: "Open PnL", value: "+$4,218.44", change: "+3.4%" },
  { label: "Copied traders", value: "6", change: "+2 this month" },
  { label: "Risk score", value: "42/100", change: "Moderate" },
] as const;

export const openPositions = [
  { pair: "BTC/USDT", side: "Long", size: "$12,500", entry: "$101,280", pnl: "+$642.30" },
  { pair: "ETH/USDT", side: "Long", size: "$8,200", entry: "$5,112", pnl: "+$214.12" },
  { pair: "SOL/USDT", side: "Short", size: "$4,600", entry: "$248.10", pnl: "-$81.44" },
] as const;

export const copyAllocations = [
  { trader: "Mira Quant", allocation: "$28,000", copyRatio: "40%", risk: "Medium", status: "Active" },
  { trader: "Delta Vega", allocation: "$18,500", copyRatio: "25%", risk: "Low", status: "Active" },
  { trader: "Apex Ledger", allocation: "$9,200", copyRatio: "15%", risk: "Low", status: "Paused" },
] as const;

export const walletBalances = [
  { label: "Demo balance", value: "$94,200.00" },
  { label: "Bonus balance", value: "$8,500.00" },
  { label: "Locked margin", value: "$22,720.80" },
  { label: "Available", value: "$71,479.20" },
] as const;

export const transactions = [
  { type: "Demo deposit", amount: "+$50,000.00", status: "Completed", date: "May 18, 2026" },
  { type: "Copied trade PnL", amount: "+$642.30", status: "Settled", date: "May 18, 2026" },
  { type: "Withdrawal request", amount: "-$2,500.00", status: "Review", date: "May 17, 2026" },
  { type: "Bonus credit", amount: "+$1,200.00", status: "Completed", date: "May 16, 2026" },
] as const;

export const supportTickets = [
  { subject: "Verification document review", status: "Open", priority: "Medium", updated: "12 min ago" },
  { subject: "Copy ratio explanation", status: "Answered", priority: "Low", updated: "2h ago" },
  { subject: "Withdrawal simulation request", status: "Pending", priority: "High", updated: "1d ago" },
] as const;

export const verificationSteps = [
  { label: "Profile details", status: "Complete" },
  { label: "Identity document", status: "In review" },
  { label: "Address proof", status: "Required" },
  { label: "Admin approval", status: "Waiting" },
] as const;

export const settingsGroups = [
  {
    title: "Account",
    rows: ["Display name", "Email preferences", "Session timeout"],
  },
  {
    title: "Trading",
    rows: ["Default copy ratio", "Max position size", "Risk alerts"],
  },
  {
    title: "Security",
    rows: ["Two-factor status", "Login history", "Device management"],
  },
] as const;
