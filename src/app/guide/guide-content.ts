export const userFlowSteps = [
  {
    step: "01",
    title: "Create a demo account",
    description:
      "Register, verify your email, and enter the protected workspace. The account is for simulation only, so no real exchange or payment account is connected.",
  },
  {
    step: "02",
    title: "Explore live market context",
    description:
      "Use real crypto pairs, live prices, candles, 24h change, and volume as the market background for simulated decisions.",
  },
  {
    step: "03",
    title: "Open simulated positions",
    description:
      "Place buy or sell demo orders, set optional stop loss and take profit levels, and track open exposure from the terminal.",
  },
  {
    step: "04",
    title: "Copy or publish strategies",
    description:
      "Follow published trader profiles or publish your own simulated profile so other demo users can copy your activity.",
  },
] as const;

export const workspaceAreas = [
  ["Dashboard", "Your operating overview: balances, open risk, copy status, support state, and live PnL context."],
  ["Terminal", "The trading workspace for real market data, simulated order entry, open positions, and risk exits."],
  ["Copy Trading", "Manage who you copy, allocation percentage, copied exposure, and active or paused copy settings."],
  ["Marketplace", "Browse published simulated trader profiles and start copy settings from profile statistics."],
  ["Wallet", "Request simulated deposits and withdrawals, apply bonus codes, and review account activity."],
  [
    "Verification",
    "Submit a KYC request for the admin review workflow. It is a portfolio simulation, not real compliance onboarding.",
  ],
  ["Support", "Create support tickets and receive admin replies inside the platform."],
  ["Settings", "Update your profile details used across the authenticated workspace."],
] as const;

export const boundaryRows = [
  ["Real market data", "Crypto pairs, live prices, candles, 24h change, and volume"],
  ["Simulated finance", "Balances, deposits, withdrawals, bonuses, trades, copied trades, and PnL settlement"],
  ["Calculated results", "PnL and copy outcomes are calculated from real price movement against simulated positions"],
] as const;

export const adminCapabilities = [
  "Review users, roles, bans, and access state",
  "Approve or reject simulated deposits and withdrawals",
  "Manage enabled trading pairs and bonus campaigns",
  "Review support tickets, KYC requests, trades, copy settings, and referrals",
] as const;
