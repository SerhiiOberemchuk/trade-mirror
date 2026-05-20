CREATE TYPE "public"."bonus_campaign_status" AS ENUM('enabled', 'paused');--> statement-breakpoint
CREATE TYPE "public"."bonus_reward_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TABLE "bonus_campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"reward_type" "bonus_reward_type" DEFAULT 'percent' NOT NULL,
	"reward_value" integer NOT NULL,
	"status" "bonus_campaign_status" DEFAULT 'enabled' NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "bonus_campaign_code_unique" ON "bonus_campaign" USING btree ("code");