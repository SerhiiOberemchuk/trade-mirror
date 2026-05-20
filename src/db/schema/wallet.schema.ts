import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const withdrawalRiskLevelEnum = pgEnum("withdrawal_risk_level", [
  "low",
  "medium",
  "high",
]);

export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
]);

export const depositStatusEnum = pgEnum("deposit_status", [
  "pending",
  "approved",
  "rejected",
]);

export const withdrawalRequestsSchema = pgTable("withdrawal_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  riskLevel: withdrawalRiskLevelEnum("risk_level").default("low").notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const depositRequestsSchema = pgTable("deposit_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD").notNull(),
  method: text("method").default("Demo card").notNull(),
  status: depositStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const withdrawalRequestsRelations = relations(withdrawalRequestsSchema, ({ one }) => ({
  user: one(user, {
    fields: [withdrawalRequestsSchema.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [withdrawalRequestsSchema.reviewedById],
    references: [user.id],
  }),
}));

export const depositRequestsRelations = relations(depositRequestsSchema, ({ one }) => ({
  user: one(user, {
    fields: [depositRequestsSchema.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [depositRequestsSchema.reviewedById],
    references: [user.id],
  }),
}));
