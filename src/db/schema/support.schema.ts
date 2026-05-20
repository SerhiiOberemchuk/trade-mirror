import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const supportTicketPriorityEnum = pgEnum("support_ticket_priority", [
  "low",
  "medium",
  "high",
]);

export const supportTicketStatusEnum = pgEnum("support_ticket_status", [
  "open",
  "answered",
  "closed",
]);

export const supportTicketsSchema = pgTable("support_ticket", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: supportTicketPriorityEnum("priority").default("medium").notNull(),
  status: supportTicketStatusEnum("status").default("open").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  closedAt: timestamp("closed_at"),
  closedById: text("closed_by_id").references(() => user.id, { onDelete: "set null" }),
});

export const supportTicketsRelations = relations(supportTicketsSchema, ({ one }) => ({
  user: one(user, {
    fields: [supportTicketsSchema.userId],
    references: [user.id],
  }),
  closedBy: one(user, {
    fields: [supportTicketsSchema.closedById],
    references: [user.id],
  }),
}));
