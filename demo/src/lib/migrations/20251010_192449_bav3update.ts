import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"team_id_id" integer NOT NULL,
  	"user_id_id" integer NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "sessions" RENAME COLUMN "impersonated_by_id" TO "impersonated_by";
  ALTER TABLE "sessions" RENAME COLUMN "active_organization_id" TO "active_organization";
  ALTER TABLE "sessions" DROP CONSTRAINT "sessions_impersonated_by_id_users_id_fk";
  
  ALTER TABLE "sessions" DROP CONSTRAINT "sessions_active_organization_id_organizations_id_fk";
  
  DROP INDEX "users_created_at_idx";
  DROP INDEX "users_updated_at_idx";
  DROP INDEX "users_ban_expires_idx";
  DROP INDEX "sessions_created_at_idx";
  DROP INDEX "sessions_updated_at_idx";
  DROP INDEX "sessions_impersonated_by_idx";
  DROP INDEX "sessions_active_organization_idx";
  DROP INDEX "accounts_account_id_idx";
  DROP INDEX "accounts_access_token_expires_at_idx";
  DROP INDEX "accounts_refresh_token_expires_at_idx";
  DROP INDEX "accounts_created_at_idx";
  DROP INDEX "accounts_updated_at_idx";
  DROP INDEX "verifications_identifier_idx";
  DROP INDEX "verifications_expires_at_idx";
  DROP INDEX "verifications_created_at_idx";
  DROP INDEX "verifications_updated_at_idx";
  DROP INDEX "two_factors_secret_idx";
  DROP INDEX "passkeys_public_key_idx";
  DROP INDEX "api_keys_last_refill_at_idx";
  DROP INDEX "api_keys_last_request_idx";
  DROP INDEX "api_keys_expires_at_idx";
  DROP INDEX "api_keys_created_at_idx";
  DROP INDEX "api_keys_updated_at_idx";
  DROP INDEX "invitations_email_idx";
  DROP INDEX "invitations_team_idx";
  DROP INDEX "teams_created_at_idx";
  DROP INDEX "teams_updated_at_idx";
  ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "is_anonymous" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "phone_number_verified" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar;
  ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "banned" DROP DEFAULT;
  ALTER TABLE "passkeys" ALTER COLUMN "transports" DROP NOT NULL;
  ALTER TABLE "api_keys" ALTER COLUMN "enabled" DROP DEFAULT;
  ALTER TABLE "api_keys" ALTER COLUMN "rate_limit_enabled" DROP DEFAULT;
  ALTER TABLE "api_keys" ALTER COLUMN "metadata" SET DATA TYPE varchar;
  ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "members" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "sessions" ADD COLUMN "active_team_id" varchar;
  ALTER TABLE "passkeys" ADD COLUMN "aaguid" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_members_id" integer;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_id_teams_id_fk" FOREIGN KEY ("team_id_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_id_users_id_fk" FOREIGN KEY ("user_id_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "team_members_team_id_idx" ON "team_members" USING btree ("team_id_id");
  CREATE INDEX "team_members_user_id_idx" ON "team_members" USING btree ("user_id_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  ALTER TABLE "members" DROP COLUMN "team";
  DROP TYPE "public"."enum_users_role";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
  ALTER TABLE "team_members" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "team_members" CASCADE;
  ALTER TABLE "sessions" RENAME COLUMN "impersonated_by" TO "impersonated_by_id";
  ALTER TABLE "sessions" RENAME COLUMN "active_organization" TO "active_organization_id";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_members_fk";
  
  DROP INDEX "payload_locked_documents_rels_team_members_id_idx";
  ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "is_anonymous" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "phone_number_verified" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "banned" SET DEFAULT false;
  ALTER TABLE "passkeys" ALTER COLUMN "transports" SET NOT NULL;
  ALTER TABLE "api_keys" ALTER COLUMN "enabled" SET DEFAULT true;
  ALTER TABLE "api_keys" ALTER COLUMN "rate_limit_enabled" SET DEFAULT true;
  ALTER TABLE "api_keys" ALTER COLUMN "metadata" SET DATA TYPE jsonb;
  ALTER TABLE "organizations" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'member';
  ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending';
  ALTER TABLE "members" ADD COLUMN "team" varchar;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_id_users_id_fk" FOREIGN KEY ("impersonated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_ban_expires_idx" ON "users" USING btree ("ban_expires");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
  CREATE INDEX "sessions_impersonated_by_idx" ON "sessions" USING btree ("impersonated_by_id");
  CREATE INDEX "sessions_active_organization_idx" ON "sessions" USING btree ("active_organization_id");
  CREATE INDEX "accounts_account_id_idx" ON "accounts" USING btree ("account_id");
  CREATE INDEX "accounts_access_token_expires_at_idx" ON "accounts" USING btree ("access_token_expires_at");
  CREATE INDEX "accounts_refresh_token_expires_at_idx" ON "accounts" USING btree ("refresh_token_expires_at");
  CREATE INDEX "accounts_created_at_idx" ON "accounts" USING btree ("created_at");
  CREATE INDEX "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
  CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");
  CREATE INDEX "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");
  CREATE INDEX "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  CREATE INDEX "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
  CREATE INDEX "two_factors_secret_idx" ON "two_factors" USING btree ("secret");
  CREATE INDEX "passkeys_public_key_idx" ON "passkeys" USING btree ("public_key");
  CREATE INDEX "api_keys_last_refill_at_idx" ON "api_keys" USING btree ("last_refill_at");
  CREATE INDEX "api_keys_last_request_idx" ON "api_keys" USING btree ("last_request");
  CREATE INDEX "api_keys_expires_at_idx" ON "api_keys" USING btree ("expires_at");
  CREATE INDEX "api_keys_created_at_idx" ON "api_keys" USING btree ("created_at");
  CREATE INDEX "api_keys_updated_at_idx" ON "api_keys" USING btree ("updated_at");
  CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");
  CREATE INDEX "invitations_team_idx" ON "invitations" USING btree ("team");
  ALTER TABLE "sessions" DROP COLUMN "active_team_id";
  ALTER TABLE "passkeys" DROP COLUMN "aaguid";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_members_id";`)
}
