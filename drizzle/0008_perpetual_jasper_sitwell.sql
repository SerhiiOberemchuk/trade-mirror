CREATE TYPE "public"."copy_setting_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."trader_profile_risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."trader_profile_status" AS ENUM('published', 'paused');--> statement-breakpoint
CREATE TABLE "copy_setting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_user_id" text,
	"follower_name" text NOT NULL,
	"follower_email" text NOT NULL,
	"trader_profile_id" uuid,
	"trader_name" text NOT NULL,
	"allocation_cents" integer NOT NULL,
	"copy_ratio_bps" integer NOT NULL,
	"status" "copy_setting_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trader_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"display_name" text NOT NULL,
	"strategy" text NOT NULL,
	"risk_level" "trader_profile_risk_level" DEFAULT 'medium' NOT NULL,
	"monthly_pnl_bps" integer DEFAULT 0 NOT NULL,
	"win_rate_bps" integer DEFAULT 0 NOT NULL,
	"max_drawdown_bps" integer DEFAULT 0 NOT NULL,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"status" "trader_profile_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "copy_setting" ADD CONSTRAINT "copy_setting_follower_user_id_user_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copy_setting" ADD CONSTRAINT "copy_setting_trader_profile_id_trader_profile_id_fk" FOREIGN KEY ("trader_profile_id") REFERENCES "public"."trader_profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trader_profile" ADD CONSTRAINT "trader_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;