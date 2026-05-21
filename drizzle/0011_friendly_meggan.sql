CREATE TYPE "public"."referral_profile_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TABLE "referral_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_user_id" text,
	"referrer_name" text NOT NULL,
	"referrer_email" text NOT NULL,
	"code" text NOT NULL,
	"signups_count" integer DEFAULT 0 NOT NULL,
	"active_users_count" integer DEFAULT 0 NOT NULL,
	"reward_cents" integer DEFAULT 0 NOT NULL,
	"status" "referral_profile_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "referral_profile" ADD CONSTRAINT "referral_profile_referrer_user_id_user_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "referral_profile_code_unique" ON "referral_profile" USING btree ("code");