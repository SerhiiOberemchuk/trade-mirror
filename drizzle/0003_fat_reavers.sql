CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."trading_pair_status" AS ENUM('enabled', 'paused');--> statement-breakpoint
CREATE TABLE "deposit_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"method" text DEFAULT 'Demo card' NOT NULL,
	"status" "deposit_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by_id" text,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "trading_pair" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" text NOT NULL,
	"base_asset" text NOT NULL,
	"quote_asset" text NOT NULL,
	"status" "trading_pair_status" DEFAULT 'enabled' NOT NULL,
	"spread_bps" integer DEFAULT 2 NOT NULL,
	"max_leverage" integer DEFAULT 10 NOT NULL,
	"simulated_volume_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deposit_request" ADD CONSTRAINT "deposit_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_request" ADD CONSTRAINT "deposit_request_reviewed_by_id_user_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "trading_pair_symbol_unique" ON "trading_pair" USING btree ("symbol");