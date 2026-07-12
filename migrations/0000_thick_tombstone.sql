CREATE TYPE "public"."place_type" AS ENUM('restaurant', 'bar', 'cafe', 'club', 'other');--> statement-breakpoint
CREATE TYPE "public"."place_vibe" AS ENUM('elegant', 'relaxing', 'family', 'hipster', 'modern', 'retro');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('needs_clarification', 'pending', 'published', 'resigned_by_user');--> statement-breakpoint
CREATE TYPE "public"."saved_place" AS ENUM('favorite', 'wanna_visit', 'blacklist');--> statement-breakpoint
CREATE TYPE "public"."user_nearest_city" AS ENUM('warszawa', 'krakow', 'wroclaw', 'poznan', 'gdansk', 'gdynia', 'sopot', 'katowice', 'szczecin', 'lodz', 'bialystok', 'bydgoszcz', 'torun', 'gorzow_wlkp', 'kielce', 'lublin', 'olsztyn', 'opole', 'rzeszow', 'zielona_gora');--> statement-breakpoint
CREATE TYPE "public"."user_rank" AS ENUM('newbie', 'member', 'aspiring_guide', 'guide');--> statement-breakpoint
CREATE TABLE "place_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"title" varchar(100),
	"body" text NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_description" text,
	"type" "place_type" DEFAULT 'restaurant' NOT NULL,
	"vibe" "place_vibe" NOT NULL,
	"pet_friendly" boolean DEFAULT false,
	"child_menu" boolean DEFAULT false,
	"latitude" double precision,
	"longitude" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"visit_id" uuid NOT NULL,
	"title" varchar(100),
	"body" text NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"personal_note" varchar(255),
	"type" "saved_place" DEFAULT 'favorite' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(50) NOT NULL,
	"short_description" varchar(255),
	"color" varchar(7) DEFAULT '#6b7280',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"rank" "user_rank" DEFAULT 'newbie' NOT NULL,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"area" "user_nearest_city",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"visit_date" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"cost" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_reviews" ADD CONSTRAINT "place_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_reviews" ADD CONSTRAINT "place_reviews_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_places" ADD CONSTRAINT "saved_places_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_places" ADD CONSTRAINT "saved_places_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;