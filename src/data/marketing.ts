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
    description: "For users who want the full copy trading workspace.",
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
  ["Is TradeMirror real trading?", "No. Balances, deposits, withdrawals, bonuses, and orders are simulated for portfolio and product demonstration purposes."],
  ["Is market data live?", "Yes. Enabled crypto pairs can use normalized Binance market data for live prices, candles, 24h change, and volume."],
  ["Can users become copy traders?", "Yes. Users can publish simulated trader profiles with PnL, risk, followers, and copy controls."],
  ["Is there an admin panel?", "Yes. Admin screens manage users, trading pairs, deposits, withdrawals, bonuses, referrals, support tickets, KYC, trades, and copy activity."],
] as const;
