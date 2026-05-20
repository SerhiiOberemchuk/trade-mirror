import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const withdrawalRiskLevel = pgEnum("withdrawal_risk_level", [
  "low",
  "medium",
  "high",
]);

export const withdrawalStatus = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
]);

export const depositStatus = pgEnum("deposit_status", [
  "pending",
  "approved",
  "rejected",
]);

export const tradingPairStatus = pgEnum("trading_pair_status", [
  "enabled",
  "paused",
]);

export const supportTicketPriority = pgEnum("support_ticket_priority", [
  "low",
  "medium",
  "high",
]);

export const supportTicketStatus = pgEnum("support_ticket_status", [
  "open",
  "answered",
  "closed",
]);

export const kycDocumentType = pgEnum("kyc_document_type", [
  "identity",
  "address",
  "business",
]);

export const kycRequestStatus = pgEnum("kyc_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const bonusCampaignStatus = pgEnum("bonus_campaign_status", [
  "enabled",
  "paused",
]);

export const bonusRewardType = pgEnum("bonus_reward_type", [
  "percent",
  "fixed",
]);

export const simulatedPositionSide = pgEnum("simulated_position_side", [
  "long",
  "short",
]);

export const simulatedPositionStatus = pgEnum("simulated_position_status", [
  "open",
  "closed",
]);

export const simulatedTradeAction = pgEnum("simulated_trade_action", [
  "open",
  "close",
]);

export const simulatedTradeSource = pgEnum("simulated_trade_source", [
  "manual",
  "copy",
]);

export const traderProfileRiskLevel = pgEnum("trader_profile_risk_level", [
  "low",
  "medium",
  "high",
]);

export const traderProfileStatus = pgEnum("trader_profile_status", [
  "published",
  "paused",
]);

export const copySettingStatus = pgEnum("copy_setting_status", [
  "active",
  "paused",
]);

export const withdrawalRequests = pgTable("withdrawal_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  riskLevel: withdrawalRiskLevel("risk_level").default("low").notNull(),
  status: withdrawalStatus("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const depositRequests = pgTable("deposit_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  method: text("method").default("Demo card").notNull(),
  status: depositStatus("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const tradingPairs = pgTable(
  "trading_pair",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    baseAsset: text("base_asset").notNull(),
    quoteAsset: text("quote_asset").notNull(),
    status: tradingPairStatus("status").default("enabled").notNull(),
    spreadBps: integer("spread_bps").default(2).notNull(),
    maxLeverage: integer("max_leverage").default(10).notNull(),
    simulatedVolumeCents: integer("simulated_volume_cents").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [uniqueIndex("trading_pair_symbol_unique").on(table.symbol)],
);

export const supportTickets = pgTable("support_ticket", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: supportTicketPriority("priority").default("medium").notNull(),
  status: supportTicketStatus("status").default("open").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  closedAt: timestamp("closed_at"),
  closedById: text("closed_by_id").references(() => user.id, { onDelete: "set null" }),
});

export const kycRequests = pgTable("kyc_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  legalName: text("legal_name").notNull(),
  country: text("country").notNull(),
  documentType: kycDocumentType("document_type").default("identity").notNull(),
  documentReference: text("document_reference").notNull(),
  status: kycRequestStatus("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const bonusCampaigns = pgTable(
  "bonus_campaign",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    rewardType: bonusRewardType("reward_type").default("percent").notNull(),
    rewardValue: integer("reward_value").notNull(),
    status: bonusCampaignStatus("status").default("enabled").notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [uniqueIndex("bonus_campaign_code_unique").on(table.code)],
);

export const simulatedPositions = pgTable("simulated_position", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  pairSymbol: text("pair_symbol").notNull(),
  side: simulatedPositionSide("side").notNull(),
  source: simulatedTradeSource("source").default("manual").notNull(),
  notionalCents: integer("notional_cents").notNull(),
  leverage: integer("leverage").default(1).notNull(),
  entryPriceCents: integer("entry_price_cents").notNull(),
  status: simulatedPositionStatus("status").default("open").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  closedPriceCents: integer("closed_price_cents"),
  realizedPnlCents: integer("realized_pnl_cents"),
});

export const simulatedTrades = pgTable("simulated_trade", {
  id: uuid("id").defaultRandom().primaryKey(),
  positionId: uuid("position_id").references(() => simulatedPositions.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  pairSymbol: text("pair_symbol").notNull(),
  side: simulatedPositionSide("side").notNull(),
  action: simulatedTradeAction("action").notNull(),
  source: simulatedTradeSource("source").default("manual").notNull(),
  notionalCents: integer("notional_cents").notNull(),
  priceCents: integer("price_cents").notNull(),
  pnlCents: integer("pnl_cents").default(0).notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const traderProfiles = pgTable("trader_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  displayName: text("display_name").notNull(),
  strategy: text("strategy").notNull(),
  riskLevel: traderProfileRiskLevel("risk_level").default("medium").notNull(),
  monthlyPnlBps: integer("monthly_pnl_bps").default(0).notNull(),
  winRateBps: integer("win_rate_bps").default(0).notNull(),
  maxDrawdownBps: integer("max_drawdown_bps").default(0).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  status: traderProfileStatus("status").default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const copySettings = pgTable("copy_setting", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerUserId: text("follower_user_id").references(() => user.id, { onDelete: "set null" }),
  followerName: text("follower_name").notNull(),
  followerEmail: text("follower_email").notNull(),
  traderProfileId: uuid("trader_profile_id").references(() => traderProfiles.id, { onDelete: "set null" }),
  traderName: text("trader_name").notNull(),
  allocationCents: integer("allocation_cents").notNull(),
  copyRatioBps: integer("copy_ratio_bps").notNull(),
  status: copySettingStatus("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const withdrawalRequestRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(user, {
    fields: [withdrawalRequests.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [withdrawalRequests.reviewedById],
    references: [user.id],
  }),
}));

export const depositRequestRelations = relations(depositRequests, ({ one }) => ({
  user: one(user, {
    fields: [depositRequests.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [depositRequests.reviewedById],
    references: [user.id],
  }),
}));

export const supportTicketRelations = relations(supportTickets, ({ one }) => ({
  user: one(user, {
    fields: [supportTickets.userId],
    references: [user.id],
  }),
  closedBy: one(user, {
    fields: [supportTickets.closedById],
    references: [user.id],
  }),
}));

export const kycRequestRelations = relations(kycRequests, ({ one }) => ({
  user: one(user, {
    fields: [kycRequests.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [kycRequests.reviewedById],
    references: [user.id],
  }),
}));

export const simulatedPositionRelations = relations(simulatedPositions, ({ many, one }) => ({
  user: one(user, {
    fields: [simulatedPositions.userId],
    references: [user.id],
  }),
  trades: many(simulatedTrades),
}));

export const simulatedTradeRelations = relations(simulatedTrades, ({ one }) => ({
  user: one(user, {
    fields: [simulatedTrades.userId],
    references: [user.id],
  }),
  position: one(simulatedPositions, {
    fields: [simulatedTrades.positionId],
    references: [simulatedPositions.id],
  }),
}));

export const traderProfileRelations = relations(traderProfiles, ({ many, one }) => ({
  user: one(user, {
    fields: [traderProfiles.userId],
    references: [user.id],
  }),
  copySettings: many(copySettings),
}));

export const copySettingRelations = relations(copySettings, ({ one }) => ({
  follower: one(user, {
    fields: [copySettings.followerUserId],
    references: [user.id],
  }),
  traderProfile: one(traderProfiles, {
    fields: [copySettings.traderProfileId],
    references: [traderProfiles.id],
  }),
}));
