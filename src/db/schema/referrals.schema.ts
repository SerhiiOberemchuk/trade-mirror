import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const referralProfileStatusEnum = pgEnum("referral_profile_status", [
  "active",
  "paused",
]);

export const referralProfilesSchema = pgTable(
  "referral_profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    referrerUserId: text("referrer_user_id").references(() => user.id, { onDelete: "set null" }),
    referrerName: text("referrer_name").notNull(),
    referrerEmail: text("referrer_email").notNull(),
    code: text("code").notNull(),
    signupsCount: integer("signups_count").default(0).notNull(),
    activeUsersCount: integer("active_users_count").default(0).notNull(),
    rewardCents: integer("reward_cents").default(0).notNull(),
    status: referralProfileStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [uniqueIndex("referral_profile_code_unique").on(table.code)],
);

export const referralProfilesRelations = relations(referralProfilesSchema, ({ one }) => ({
  referrer: one(user, {
    fields: [referralProfilesSchema.referrerUserId],
    references: [user.id],
  }),
}));
