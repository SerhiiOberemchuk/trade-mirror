export const CACHE_TAGS = {
  adminBonuses: "admin:bonuses",
  adminCopyTrading: "admin:copy-trading",
  adminDeposits: "admin:deposits",
  adminKyc: "admin:kyc",
  adminNotifications: "admin:notifications",
  adminReferrals: "admin:referrals",
  adminSupport: "admin:support",
  adminTradingPairs: "admin:trading-pairs",
  adminTrades: "admin:trades",
  adminUsers: "admin:users",
  adminWithdrawals: "admin:withdrawals",
  traderMarketplace: "trader-marketplace",
} as const;

export const cacheTags = {
  userDashboard: (userId: string) => `user:${userId}:dashboard`,
  userCopyTrading: (userId: string) => `user:${userId}:copy-trading`,
  userHistory: (userId: string) => `user:${userId}:history`,
  userNotifications: (userId: string) => `user:${userId}:notifications`,
  userSupport: (userId: string) => `user:${userId}:support`,
  userSettings: (userId: string) => `user:${userId}:settings`,
  userTerminal: (userId: string) => `user:${userId}:terminal`,
  userTraderProfile: (userId: string) => `user:${userId}:trader-profile`,
  userVerification: (userId: string) => `user:${userId}:verification`,
  userWallet: (userId: string) => `user:${userId}:wallet`,
} as const;
