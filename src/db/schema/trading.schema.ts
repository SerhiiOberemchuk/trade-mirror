import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const simulatedPositionSideEnum = pgEnum("simulated_position_side", [
  "long",
  "short",
]);

export const simulatedPositionStatusEnum = pgEnum("simulated_position_status", [
  "open",
  "closed",
]);

export const simulatedTradeActionEnum = pgEnum("simulated_trade_action", [
  "open",
  "close",
]);

export const simulatedTradeSourceEnum = pgEnum("simulated_trade_source", [
  "manual",
  "copy",
]);

export const simulatedPositionsSchema = pgTable("simulated_position", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  pairSymbol: text("pair_symbol").notNull(),
  side: simulatedPositionSideEnum("side").notNull(),
  source: simulatedTradeSourceEnum("source").default("manual").notNull(),
  notionalCents: integer("notional_cents").notNull(),
  leverage: integer("leverage").default(1).notNull(),
  entryPriceCents: integer("entry_price_cents").notNull(),
  status: simulatedPositionStatusEnum("status").default("open").notNull(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  closedPriceCents: integer("closed_price_cents"),
  realizedPnlCents: integer("realized_pnl_cents"),
  copiedFromPositionId: uuid("copied_from_position_id"),
  copiedFromTraderProfileId: uuid("copied_from_trader_profile_id"),
  stopLossPriceCents: integer("stop_loss_price_cents"),
  takeProfitPriceCents: integer("take_profit_price_cents"),
});

export const simulatedTradesSchema = pgTable("simulated_trade", {
  id: uuid("id").defaultRandom().primaryKey(),
  positionId: uuid("position_id").references(() => simulatedPositionsSchema.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  pairSymbol: text("pair_symbol").notNull(),
  side: simulatedPositionSideEnum("side").notNull(),
  action: simulatedTradeActionEnum("action").notNull(),
  source: simulatedTradeSourceEnum("source").default("manual").notNull(),
  notionalCents: integer("notional_cents").notNull(),
  priceCents: integer("price_cents").notNull(),
  pnlCents: integer("pnl_cents").default(0).notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const simulatedPositionsRelations = relations(simulatedPositionsSchema, ({ many, one }) => ({
  user: one(user, {
    fields: [simulatedPositionsSchema.userId],
    references: [user.id],
  }),
  trades: many(simulatedTradesSchema),
}));

export const simulatedTradesRelations = relations(simulatedTradesSchema, ({ one }) => ({
  user: one(user, {
    fields: [simulatedTradesSchema.userId],
    references: [user.id],
  }),
  position: one(simulatedPositionsSchema, {
    fields: [simulatedTradesSchema.positionId],
    references: [simulatedPositionsSchema.id],
  }),
}));
