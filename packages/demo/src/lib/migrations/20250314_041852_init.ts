import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"username" varchar NOT NULL,
  	"display_username" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"normalized_email" varchar,
  	"phone_number" varchar,
  	"phone_number_verified" boolean DEFAULT false,
  	"email_verified" boolean DEFAULT false NOT NULL,
  	"is_anonymous" boolean DEFAULT false,
  	"image" varchar,
  	"two_factor_enabled" boolean DEFAULT false,
  	"role" "enum_users_role" DEFAULT 'user' NOT NULL,
  	"banned" boolean DEFAULT false,
  	"ban_reason" varchar,
  	"ban_expires" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "sessions" (
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
  
  CREATE TABLE IF NOT EXISTS "accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"account_id" varchar NOT NULL,
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
  
  CREATE TABLE IF NOT EXISTS "verifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"start" varchar,
  	"prefix" varchar,
  	"key" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"refill_interval" numeric,
  	"refill_amount" numeric,
  	"last_refill_at" timestamp(3) with time zone,
  	"enabled" boolean DEFAULT true,
  	"rate_limit_enabled" boolean DEFAULT true,
  	"rate_limit_time_window" numeric,
  	"rate_limit_max" numeric,
  	"requst_count" numeric NOT NULL,
  	"remaining" numeric,
  	"last_request" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"permissions" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"logo" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"team_id" integer,
  	"role" varchar DEFAULT 'member' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"organization_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "invitations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"inviter_id" integer NOT NULL,
  	"organization_id" integer NOT NULL,
  	"role" varchar NOT NULL,
  	"status" varchar DEFAULT 'pending' NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "two_factors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"secret" varchar,
  	"backup_codes" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "passkeys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"public_key" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"credential_i_d" varchar NOT NULL,
  	"counter" numeric NOT NULL,
  	"device_type" varchar NOT NULL,
  	"backed_up" boolean DEFAULT false NOT NULL,
  	"transports" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" varchar NOT NULL,
  	"client_secret" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"redirect_u_r_ls" varchar NOT NULL,
  	"metadata" jsonb,
  	"type" varchar NOT NULL,
  	"disabled" boolean DEFAULT false NOT NULL,
  	"icon" varchar,
  	"user_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_access_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"access_token" varchar NOT NULL,
  	"refresh_token" varchar NOT NULL,
  	"access_token_expires_at" timestamp(3) with time zone NOT NULL,
  	"refresh_token_expires_at" timestamp(3) with time zone NOT NULL,
  	"client_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"scopes" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "oauth_consents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"scopes" varchar NOT NULL,
  	"consent_given" boolean DEFAULT false NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "sso_providers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"issuer" varchar NOT NULL,
  	"domain" varchar NOT NULL,
  	"oidc_config" varchar NOT NULL,
  	"user_id" integer NOT NULL,
  	"provider_id" varchar NOT NULL,
  	"organization_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "jwks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_key" varchar NOT NULL,
  	"private_key" varchar NOT NULL,
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
  	"users_id" integer,
  	"sessions_id" integer,
  	"accounts_id" integer,
  	"verifications_id" integer,
  	"api_keys_id" integer,
  	"organizations_id" integer,
  	"members_id" integer,
  	"teams_id" integer,
  	"invitations_id" integer,
  	"two_factors_id" integer,
  	"passkeys_id" integer,
  	"oauth_applications_id" integer,
  	"oauth_access_tokens_id" integer,
  	"oauth_consents_id" integer,
  	"sso_providers_id" integer,
  	"jwks_id" integer
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
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DO $$ BEGIN
   ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_id_users_id_fk" FOREIGN KEY ("impersonated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "members" ADD CONSTRAINT "members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "oauth_applications" ADD CONSTRAINT "oauth_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_client_id_oauth_applications_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_applications"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_oauth_applications_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_applications"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "sso_providers" ADD CONSTRAINT "sso_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sessions_fk" FOREIGN KEY ("sessions_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accounts_fk" FOREIGN KEY ("accounts_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verifications_fk" FOREIGN KEY ("verifications_id") REFERENCES "public"."verifications"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_api_keys_fk" FOREIGN KEY ("api_keys_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invitations_fk" FOREIGN KEY ("invitations_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_two_factors_fk" FOREIGN KEY ("two_factors_id") REFERENCES "public"."two_factors"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_passkeys_fk" FOREIGN KEY ("passkeys_id") REFERENCES "public"."passkeys"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_applications_fk" FOREIGN KEY ("oauth_applications_id") REFERENCES "public"."oauth_applications"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_access_tokens_fk" FOREIGN KEY ("oauth_access_tokens_id") REFERENCES "public"."oauth_access_tokens"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_oauth_consents_fk" FOREIGN KEY ("oauth_consents_id") REFERENCES "public"."oauth_consents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sso_providers_fk" FOREIGN KEY ("sso_providers_id") REFERENCES "public"."sso_providers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jwks_fk" FOREIGN KEY ("jwks_id") REFERENCES "public"."jwks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_normalized_email_idx" ON "users" USING btree ("normalized_email");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" USING btree ("user_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" USING btree ("token");
  CREATE INDEX IF NOT EXISTS "sessions_impersonated_by_idx" ON "sessions" USING btree ("impersonated_by_id");
  CREATE INDEX IF NOT EXISTS "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "accounts_user_idx" ON "accounts" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "accounts_account_id_idx" ON "accounts" USING btree ("account_id");
  CREATE INDEX IF NOT EXISTS "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "accounts_created_at_idx" ON "accounts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications" USING btree ("identifier");
  CREATE INDEX IF NOT EXISTS "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "api_keys_user_idx" ON "api_keys" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "api_keys_updated_at_idx" ON "api_keys" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "api_keys_created_at_idx" ON "api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_idx" ON "organizations" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "members_organization_idx" ON "members" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "members_user_idx" ON "members" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "members_team_idx" ON "members" USING btree ("team_id");
  CREATE INDEX IF NOT EXISTS "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "teams_organization_idx" ON "teams" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "invitations_email_idx" ON "invitations" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "invitations_inviter_idx" ON "invitations" USING btree ("inviter_id");
  CREATE INDEX IF NOT EXISTS "invitations_organization_idx" ON "invitations" USING btree ("organization_id");
  CREATE INDEX IF NOT EXISTS "invitations_updated_at_idx" ON "invitations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "invitations_created_at_idx" ON "invitations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "two_factors_user_idx" ON "two_factors" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "two_factors_secret_idx" ON "two_factors" USING btree ("secret");
  CREATE INDEX IF NOT EXISTS "two_factors_updated_at_idx" ON "two_factors" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "two_factors_created_at_idx" ON "two_factors" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "passkeys_public_key_idx" ON "passkeys" USING btree ("public_key");
  CREATE INDEX IF NOT EXISTS "passkeys_user_idx" ON "passkeys" USING btree ("user_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "passkeys_credential_i_d_idx" ON "passkeys" USING btree ("credential_i_d");
  CREATE INDEX IF NOT EXISTS "passkeys_updated_at_idx" ON "passkeys" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "passkeys_created_at_idx" ON "passkeys" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "oauth_applications_client_id_idx" ON "oauth_applications" USING btree ("client_id");
  CREATE INDEX IF NOT EXISTS "oauth_applications_name_idx" ON "oauth_applications" USING btree ("name");
  CREATE INDEX IF NOT EXISTS "oauth_applications_user_idx" ON "oauth_applications" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "oauth_applications_updated_at_idx" ON "oauth_applications" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_applications_created_at_idx" ON "oauth_applications" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "oauth_access_tokens_access_token_idx" ON "oauth_access_tokens" USING btree ("access_token");
  CREATE INDEX IF NOT EXISTS "oauth_access_tokens_client_idx" ON "oauth_access_tokens" USING btree ("client_id");
  CREATE INDEX IF NOT EXISTS "oauth_access_tokens_user_idx" ON "oauth_access_tokens" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "oauth_access_tokens_updated_at_idx" ON "oauth_access_tokens" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_access_tokens_created_at_idx" ON "oauth_access_tokens" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "oauth_consents_client_idx" ON "oauth_consents" USING btree ("client_id");
  CREATE INDEX IF NOT EXISTS "oauth_consents_user_idx" ON "oauth_consents" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "oauth_consents_updated_at_idx" ON "oauth_consents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "oauth_consents_created_at_idx" ON "oauth_consents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "sso_providers_issuer_idx" ON "sso_providers" USING btree ("issuer");
  CREATE INDEX IF NOT EXISTS "sso_providers_user_idx" ON "sso_providers" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "sso_providers_updated_at_idx" ON "sso_providers" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "sso_providers_created_at_idx" ON "sso_providers" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "jwks_public_key_idx" ON "jwks" USING btree ("public_key");
  CREATE INDEX IF NOT EXISTS "jwks_updated_at_idx" ON "jwks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "jwks_created_at_idx" ON "jwks" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("sessions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_accounts_id_idx" ON "payload_locked_documents_rels" USING btree ("accounts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_verifications_id_idx" ON "payload_locked_documents_rels" USING btree ("verifications_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("api_keys_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("teams_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("invitations_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_two_factors_id_idx" ON "payload_locked_documents_rels" USING btree ("two_factors_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_passkeys_id_idx" ON "payload_locked_documents_rels" USING btree ("passkeys_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_applications_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_access_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_access_tokens_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_oauth_consents_id_idx" ON "payload_locked_documents_rels" USING btree ("oauth_consents_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_sso_providers_id_idx" ON "payload_locked_documents_rels" USING btree ("sso_providers_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_jwks_id_idx" ON "payload_locked_documents_rels" USING btree ("jwks_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users" CASCADE;
  DROP TABLE "sessions" CASCADE;
  DROP TABLE "accounts" CASCADE;
  DROP TABLE "verifications" CASCADE;
  DROP TABLE "api_keys" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "teams" CASCADE;
  DROP TABLE "invitations" CASCADE;
  DROP TABLE "two_factors" CASCADE;
  DROP TABLE "passkeys" CASCADE;
  DROP TABLE "oauth_applications" CASCADE;
  DROP TABLE "oauth_access_tokens" CASCADE;
  DROP TABLE "oauth_consents" CASCADE;
  DROP TABLE "sso_providers" CASCADE;
  DROP TABLE "jwks" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";`)
}
