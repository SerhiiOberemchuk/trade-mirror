import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const bonusCampaignStatusEnum = pgEnum("bonus_campaign_status", [
  "enabled",
  "paused",
]);

export const bonusRewardTypeEnum = pgEnum("bonus_reward_type", [
  "percent",
  "fixed",
]);

export const bonusCampaignsSchema = pgTable(
  "bonus_campaign",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    rewardType: bonusRewardTypeEnum("reward_type").default("percent").notNull(),
    rewardValue: integer("reward_value").notNull(),
    status: bonusCampaignStatusEnum("status").default("enabled").notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [uniqueIndex("bonus_campaign_code_unique").on(table.code)],
);
