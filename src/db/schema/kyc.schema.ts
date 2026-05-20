import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../../../auth-schema";

export const kycDocumentTypeEnum = pgEnum("kyc_document_type", [
  "identity",
  "address",
  "business",
]);

export const kycRequestStatusEnum = pgEnum("kyc_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const kycRequestsSchema = pgTable("kyc_request", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  legalName: text("legal_name").notNull(),
  country: text("country").notNull(),
  documentType: kycDocumentTypeEnum("document_type").default("identity").notNull(),
  documentReference: text("document_reference").notNull(),
  status: kycRequestStatusEnum("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedById: text("reviewed_by_id").references(() => user.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
});

export const kycRequestsRelations = relations(kycRequestsSchema, ({ one }) => ({
  user: one(user, {
    fields: [kycRequestsSchema.userId],
    references: [user.id],
  }),
  reviewedBy: one(user, {
    fields: [kycRequestsSchema.reviewedById],
    references: [user.id],
  }),
}));
