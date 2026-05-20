CREATE TYPE "public"."kyc_document_type" AS ENUM('identity', 'address', 'business');--> statement-breakpoint
CREATE TYPE "public"."kyc_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "kyc_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"legal_name" text NOT NULL,
	"country" text NOT NULL,
	"document_type" "kyc_document_type" DEFAULT 'identity' NOT NULL,
	"document_reference" text NOT NULL,
	"status" "kyc_request_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by_id" text,
	"review_note" text
);
--> statement-breakpoint
ALTER TABLE "kyc_request" ADD CONSTRAINT "kyc_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_request" ADD CONSTRAINT "kyc_request_reviewed_by_id_user_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;