import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const notificationTypeEnum = pgEnum("notification_type", [
  "deposit",
  "withdrawal",
  "kyc",
  "support",
  "system",
]);

export const notificationsSchema = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: notificationTypeEnum("type").default("system").notNull(),
  href: text("href"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const notificationsRelations = relations(notificationsSchema, ({ one }) => ({
  user: one(user, {
    fields: [notificationsSchema.userId],
    references: [user.id],
  }),
}));
