import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" RENAME COLUMN "active_organization_id" TO "active_organization";
  ALTER TABLE "api_keys" RENAME COLUMN "requst_count" TO "request_count";
  ALTER TABLE "members" RENAME COLUMN "team_id" TO "team";
  ALTER TABLE "sessions" DROP CONSTRAINT "sessions_active_organization_id_organizations_id_fk";
  
  ALTER TABLE "members" DROP CONSTRAINT "members_team_id_teams_id_fk";
  
  DROP INDEX IF EXISTS "sessions_active_organization_idx";
  DROP INDEX IF EXISTS "passkeys_credential_i_d_idx";
  DROP INDEX IF EXISTS "passkeys_created_at_idx";
  DROP INDEX IF EXISTS "organizations_created_at_idx";
  DROP INDEX IF EXISTS "members_team_idx";
  DROP INDEX IF EXISTS "members_created_at_idx";
  ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "users" ALTER COLUMN "email_verified" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "two_factors" ALTER COLUMN "secret" SET NOT NULL;
  ALTER TABLE "organizations" ALTER COLUMN "metadata" SET DATA TYPE varchar;
  ALTER TABLE "invitations" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "invitations" ADD COLUMN "team" varchar;
  CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_number_idx" ON "users" USING btree ("phone_number");
  CREATE INDEX IF NOT EXISTS "users_ban_expires_idx" ON "users" USING btree ("ban_expires");
  CREATE INDEX IF NOT EXISTS "accounts_access_token_expires_at_idx" ON "accounts" USING btree ("access_token_expires_at");
  CREATE INDEX IF NOT EXISTS "accounts_refresh_token_expires_at_idx" ON "accounts" USING btree ("refresh_token_expires_at");
  CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");
  CREATE INDEX IF NOT EXISTS "verifications_expires_at_idx" ON "verifications" USING btree ("expires_at");
  CREATE INDEX IF NOT EXISTS "api_keys_last_refill_at_idx" ON "api_keys" USING btree ("last_refill_at");
  CREATE INDEX IF NOT EXISTS "api_keys_last_request_idx" ON "api_keys" USING btree ("last_request");
  CREATE INDEX IF NOT EXISTS "api_keys_expires_at_idx" ON "api_keys" USING btree ("expires_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" RENAME COLUMN "active_organization" TO "active_organization_id";
  ALTER TABLE "api_keys" RENAME COLUMN "request_count" TO "requst_count";
  ALTER TABLE "members" RENAME COLUMN "team" TO "team_id";
  DROP INDEX IF EXISTS "users_phone_number_idx";
  DROP INDEX IF EXISTS "users_ban_expires_idx";
  DROP INDEX IF EXISTS "sessions_expires_at_idx";
  DROP INDEX IF EXISTS "accounts_access_token_expires_at_idx";
  DROP INDEX IF EXISTS "accounts_refresh_token_expires_at_idx";
  DROP INDEX IF EXISTS "verifications_expires_at_idx";
  DROP INDEX IF EXISTS "api_keys_last_refill_at_idx";
  DROP INDEX IF EXISTS "api_keys_last_request_idx";
  DROP INDEX IF EXISTS "api_keys_expires_at_idx";
  ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "two_factors" ALTER COLUMN "secret" DROP NOT NULL;
  ALTER TABLE "organizations" ALTER COLUMN "metadata" SET DATA TYPE jsonb;
  ALTER TABLE "invitations" ALTER COLUMN "role" SET NOT NULL;
  DO $$ BEGIN
   ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "members" ADD CONSTRAINT "members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "sessions_active_organization_idx" ON "sessions" USING btree ("active_organization_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "passkeys_credential_i_d_idx" ON "passkeys" USING btree ("credential_i_d");
  CREATE INDEX IF NOT EXISTS "passkeys_created_at_idx" ON "passkeys" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "members_team_idx" ON "members" USING btree ("team_id");
  CREATE INDEX IF NOT EXISTS "members_created_at_idx" ON "members" USING btree ("created_at");
  ALTER TABLE "invitations" DROP COLUMN IF EXISTS "team";`)
}
