import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const tradingPairStatusEnum = pgEnum("trading_pair_status", [
  "enabled",
  "paused",
]);

export const tradingPairsSchema = pgTable(
  "trading_pair",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    symbol: text("symbol").notNull(),
    baseAsset: text("base_asset").notNull(),
    quoteAsset: text("quote_asset").notNull(),
    status: tradingPairStatusEnum("status").default("enabled").notNull(),
    spreadBps: integer("spread_bps").default(2).notNull(),
    maxLeverage: integer("max_leverage").default(10).notNull(),
    simulatedVolumeCents: integer("simulated_volume_cents").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [uniqueIndex("trading_pair_symbol_unique").on(table.symbol)],
);
