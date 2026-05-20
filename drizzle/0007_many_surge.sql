CREATE TYPE "public"."simulated_position_side" AS ENUM('long', 'short');--> statement-breakpoint
CREATE TYPE "public"."simulated_position_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."simulated_trade_action" AS ENUM('open', 'close');--> statement-breakpoint
CREATE TYPE "public"."simulated_trade_source" AS ENUM('manual', 'copy');--> statement-breakpoint
CREATE TABLE "simulated_position" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"pair_symbol" text NOT NULL,
	"side" "simulated_position_side" NOT NULL,
	"source" "simulated_trade_source" DEFAULT 'manual' NOT NULL,
	"notional_cents" integer NOT NULL,
	"leverage" integer DEFAULT 1 NOT NULL,
	"entry_price_cents" integer NOT NULL,
	"status" "simulated_position_status" DEFAULT 'open' NOT NULL,
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"closed_price_cents" integer,
	"realized_pnl_cents" integer
);
--> statement-breakpoint
CREATE TABLE "simulated_trade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid,
	"user_id" text,
	"user_name" text NOT NULL,
	"user_email" text NOT NULL,
	"pair_symbol" text NOT NULL,
	"side" "simulated_position_side" NOT NULL,
	"action" "simulated_trade_action" NOT NULL,
	"source" "simulated_trade_source" DEFAULT 'manual' NOT NULL,
	"notional_cents" integer NOT NULL,
	"price_cents" integer NOT NULL,
	"pnl_cents" integer DEFAULT 0 NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "simulated_position" ADD CONSTRAINT "simulated_position_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulated_trade" ADD CONSTRAINT "simulated_trade_position_id_simulated_position_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."simulated_position"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulated_trade" ADD CONSTRAINT "simulated_trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;