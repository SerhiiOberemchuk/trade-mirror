import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const traderProfileRiskLevelEnum = pgEnum("trader_profile_risk_level", [
  "low",
  "medium",
  "high",
]);

export const traderProfileStatusEnum = pgEnum("trader_profile_status", [
  "published",
  "paused",
]);

export const copySettingStatusEnum = pgEnum("copy_setting_status", [
  "active",
  "paused",
]);

export const traderProfilesSchema = pgTable("trader_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  displayName: text("display_name").notNull(),
  strategy: text("strategy").notNull(),
  riskLevel: traderProfileRiskLevelEnum("risk_level").default("medium").notNull(),
  monthlyPnlBps: integer("monthly_pnl_bps").default(0).notNull(),
  winRateBps: integer("win_rate_bps").default(0).notNull(),
  maxDrawdownBps: integer("max_drawdown_bps").default(0).notNull(),
  followersCount: integer("followers_count").default(0).notNull(),
  status: traderProfileStatusEnum("status").default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const copySettingsSchema = pgTable("copy_setting", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerUserId: text("follower_user_id").references(() => user.id, { onDelete: "set null" }),
  followerName: text("follower_name").notNull(),
  followerEmail: text("follower_email").notNull(),
  traderProfileId: uuid("trader_profile_id").references(() => traderProfilesSchema.id, { onDelete: "set null" }),
  traderName: text("trader_name").notNull(),
  allocationCents: integer("allocation_cents").notNull(),
  copyRatioBps: integer("copy_ratio_bps").notNull(),
  status: copySettingStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const traderProfilesRelations = relations(traderProfilesSchema, ({ many, one }) => ({
  user: one(user, {
    fields: [traderProfilesSchema.userId],
    references: [user.id],
  }),
  copySettings: many(copySettingsSchema),
}));

export const copySettingsRelations = relations(copySettingsSchema, ({ one }) => ({
  follower: one(user, {
    fields: [copySettingsSchema.followerUserId],
    references: [user.id],
  }),
  traderProfile: one(traderProfilesSchema, {
    fields: [copySettingsSchema.traderProfileId],
    references: [traderProfilesSchema.id],
  }),
}));
