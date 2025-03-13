import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_user_role" AS ENUM('admin', 'user');
  CREATE TABLE IF NOT EXISTS "user" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"email" varchar NOT NULL,
  	"email_verified" boolean DEFAULT false NOT NULL,
  	"image" varchar,
  	"two_factor_enabled" boolean DEFAULT false,
  	"role" "enum_user_role" DEFAULT 'user' NOT NULL,
  	"banned" boolean DEFAULT false,
  	"ban_reason" varchar,
  	"ban_expires" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "session" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"token" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"ip_address" varchar,
  	"user_agent" varchar,
  	"active_organization_id" varchar,
  	"impersonated_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "account" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"account_id" numeric NOT NULL,
  	"provider_id" varchar NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"access_token_expires_at" timestamp(3) with time zone,
  	"refresh_token_expires_at" timestamp(3) with time zone,
  	"scope" varchar,
  	"id_token" varchar,
  	"password" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "verification_token" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "organization" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"logo" varchar,
  	"metadata" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "member" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"role" varchar DEFAULT 'member' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "invitation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"role" varchar,
  	"status" varchar DEFAULT 'pending' NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"inviter_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "two_factor" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"secret" varchar NOT NULL,
  	"backup_codes" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "passkey" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"public_key" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"credential_i_d" varchar NOT NULL,
  	"counter" numeric NOT NULL,
  	"device_type" varchar NOT NULL,
  	"backed_up" boolean DEFAULT false NOT NULL,
  	"transports" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_application" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" varchar,
  	"metadata" varchar,
  	"client_id" varchar,
  	"client_secret" varchar,
  	"redirect_u_r_ls" varchar,
  	"type" varchar,
  	"disabled" boolean DEFAULT false,
  	"user_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_access_token" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar,
  	"refresh_token" varchar,
  	"access_token_expires_at" timestamp(3) with time zone,
  	"refresh_token_expires_at" timestamp(3) with time zone,
  	"client_id" varchar,
  	"user_id" varchar,
  	"scopes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_consent" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" varchar,
  	"user_id" varchar,
  	"scopes" varchar,
  	"consent_given" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"user_id" integer,
  	"session_id" integer,
  	"account_id" integer,
  	"verification_token_id" integer,
  	"organization_id" integer,
  	"member_id" integer,
  	"invitation_id" integer,
  	"two_factor_id" integer,
  	"passkey_id" integer,
  	"oauth_application_id" integer,
  	"oauth_access_token_id" integer,
  	"oauth_consent_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"user_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_id_user_id_fk" FOREIGN KEY ("impersonated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_session_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_account_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_token_fk" FOREIGN KEY ("verification_token_id") REFERENCES "public"."verification_token"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organization_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invitation_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_two_factor_fk" FOREIGN KEY ("two_factor_id") REFERENCES "public"."two_factor"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_passkey_fk" FOREIGN KEY ("passkey_id") REFERENCES "public"."passkey"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_application_fk" FOREIGN KEY ("oauth_application_id") REFERENCES "public"."oauth_application"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_access_token_fk" FOREIGN KEY ("oauth_access_token_id") REFERENCES "public"."oauth_access_token"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_consent_fk" FOREIGN KEY ("oauth_consent_id") REFERENCES "public"."oauth_consent"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "user" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "user_updated_at_idx" ON "user" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "user" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "session_user_idx" ON "session" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "session_impersonated_by_idx" ON "session" USING btree ("impersonated_by_id");
  CREATE INDEX IF NOT EXISTS "session_updated_at_idx" ON "session" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "session_created_at_idx" ON "session" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "account_user_idx" ON "account" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "account_updated_at_idx" ON "account" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "account_created_at_idx" ON "account" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "verification_token_updated_at_idx" ON "verification_token" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "verification_token_created_at_idx" ON "verification_token" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_idx" ON "organization" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "organization_updated_at_idx" ON "organization" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "organization_created_at_idx" ON "organization" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "member_organization_idx" ON "member" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "member_user_idx" ON "member" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "member_updated_at_idx" ON "member" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "member_created_at_idx" ON "member" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "invitation_organization_idx" ON "invitation" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "invitation_inviter_idx" ON "invitation" USING btree ("inviter_id");
  CREATE INDEX IF NOT EXISTS "invitation_updated_at_idx" ON "invitation" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "invitation_created_at_idx" ON "invitation" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "two_factor_user_idx" ON "two_factor" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "two_factor_updated_at_idx" ON "two_factor" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "two_factor_created_at_idx" ON "two_factor" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "passkey_user_idx" ON "passkey" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "passkey_updated_at_idx" ON "passkey" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "passkey_created_at_idx" ON "passkey" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "oauth_application_client_id_idx" ON "oauth_application" USING btree ("client_id");
  CREATE INDEX IF NOT EXISTS "oauth_application_updated_at_idx" ON "oauth_application" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_application_created_at_idx" ON "oauth_application" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "oauth_access_token_access_token_idx" ON "oauth_access_token" USING btree ("access_token");
  CREATE UNIQUE INDEX IF NOT EXISTS "oauth_access_token_refresh_token_idx" ON "oauth_access_token" USING btree ("refresh_token");
  CREATE INDEX IF NOT EXISTS "oauth_access_token_updated_at_idx" ON "oauth_access_token" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_access_token_created_at_idx" ON "oauth_access_token" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "oauth_consent_updated_at_idx" ON "oauth_consent" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_consent_created_at_idx" ON "oauth_consent" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_user_id_idx" ON "payload_locked_documents_rels" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_session_id_idx" ON "payload_locked_documents_rels" USING btree ("session_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_account_id_idx" ON "payload_locked_documents_rels" USING btree ("account_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_verification_token_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_token_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_organization_id_idx" ON "payload_locked_documents_rels" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_member_id_idx" ON "payload_locked_documents_rels" USING btree ("member_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invitation_id_idx" ON "payload_locked_documents_rels" USING btree ("invitation_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_two_factor_id_idx" ON "payload_locked_documents_rels" USING btree ("two_factor_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_passkey_id_idx" ON "payload_locked_documents_rels" USING btree ("passkey_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_application_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_application_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_access_token_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_access_token_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_consent_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_consent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_user_id_idx" ON "payload_preferences_rels" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "user" CASCADE;
  DROP TABLE "session" CASCADE;
  DROP TABLE "account" CASCADE;
  DROP TABLE "verification_token" CASCADE;
  DROP TABLE "organization" CASCADE;
  DROP TABLE "member" CASCADE;
  DROP TABLE "invitation" CASCADE;
  DROP TABLE "two_factor" CASCADE;
  DROP TABLE "passkey" CASCADE;
  DROP TABLE "oauth_application" CASCADE;
  DROP TABLE "oauth_access_token" CASCADE;
  DROP TABLE "oauth_consent" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_user_role";`)
}
