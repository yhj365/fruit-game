CREATE TYPE "public"."fruit_symbol" AS ENUM('apple', 'watermelon', 'papaya', 'orange', 'bell', 'sevens', 'double_star', 'bar');--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"result_index" integer NOT NULL,
	"result_symbol" "fruit_symbol" NOT NULL,
	"total_bet" integer NOT NULL,
	"win_amount" integer DEFAULT 0 NOT NULL,
	"guess_type" varchar(10),
	"guess_number" integer,
	"guess_win_amount" integer DEFAULT 0,
	"detail_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"credits" integer DEFAULT 0 NOT NULL,
	"pending_win" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;