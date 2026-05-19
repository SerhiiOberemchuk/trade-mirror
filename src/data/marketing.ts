export const marketRows = [
  { pair: "BTC/USDT", price: "$103,842.10", change: "+2.41%", volume: "$18.2B", spread: "0.02%" },
  { pair: "ETH/USDT", price: "$5,286.44", change: "+1.18%", volume: "$9.7B", spread: "0.03%" },
  { pair: "SOL/USDT", price: "$241.62", change: "-0.74%", volume: "$2.4B", spread: "0.04%" },
  { pair: "XRP/USDT", price: "$1.92", change: "+0.36%", volume: "$1.1B", spread: "0.05%" },
  { pair: "BNB/USDT", price: "$894.30", change: "+0.82%", volume: "$880M", spread: "0.03%" },
  { pair: "ADA/USDT", price: "$1.18", change: "-1.21%", volume: "$640M", spread: "0.06%" },
] as const;

export const traderRows = [
  {
    name: "Mira Quant",
    strategy: "Momentum grid",
    pnl: "+38.4%",
    winRate: "72%",
    risk: "Medium",
    followers: "12.8k",
    drawdown: "7.2%",
  },
  {
    name: "Delta Vega",
    strategy: "Swing baskets",
    pnl: "+24.9%",
    winRate: "68%",
    risk: "Low",
    followers: "9.4k",
    drawdown: "4.1%",
  },
  {
    name: "North Signal",
    strategy: "Breakout scalps",
    pnl: "+51.2%",
    winRate: "61%",
    risk: "High",
    followers: "7.1k",
    drawdown: "13.8%",
  },
  {
    name: "Apex Ledger",
    strategy: "Mean reversion",
    pnl: "+19.6%",
    winRate: "76%",
    risk: "Low",
    followers: "5.6k",
    drawdown: "3.9%",
  },
] as const;

export const chartBars = [34, 48, 42, 66, 58, 74, 69, 88, 76, 92, 84, 98] as const;

export const platformStats = [
  ["$125k", "demo equity"],
  ["18.6k", "copied trades"],
  ["99ms", "market pulse"],
] as const;

export const featureCards = [
  [
    "Copy engine",
    "Follow trader profiles with configurable copy ratio, stop loss, and simulated allocation limits.",
  ],
  [
    "Demo wallet",
    "Track demo balance, bonus balance, locked funds, and simulated transaction history.",
  ],
  [
    "Admin control",
    "Manage users, pairs, support tickets, copy activity, and platform statistics from one workspace.",
  ],
] as const;

export const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    description: "For reviewing markets and testing the simulated terminal.",
    features: ["Demo wallet", "Market watch", "Basic trader profiles", "Simulated trade history"],
  },
  {
    name: "Trader",
    price: "$29",
    description: "For users who want a full copy trading workspace preview.",
    features: ["Copy settings", "Risk controls", "Advanced trader stats", "Priority support simulation"],
  },
  {
    name: "Operator",
    price: "$79",
    description: "For showcasing admin workflows and SaaS platform controls.",
    features: ["Admin overview", "User management", "Pair management", "Support ticket queue"],
  },
] as const;

export const faqItems = [
  ["Is TradeMirror real trading?", "No. Balances, deposits, withdrawals, and orders are simulated for portfolio and product demonstration purposes."],
  ["Will market data be live?", "The design supports real-time market data. The first phase uses static demo data so the UX can be reviewed before logic is added."],
  ["Can users become copy traders?", "Yes. The planned trader marketplace lets users publish profiles with PnL, risk, followers, and trade history."],
  ["Is there an admin panel?", "Yes. Admin screens are planned for users, trading pairs, withdrawals, bonuses, support tickets, and platform statistics."],
] as const;
