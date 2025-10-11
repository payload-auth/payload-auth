import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" RENAME COLUMN "active_organization" TO "active_organization_id";
  ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "is_anonymous" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "phone_number_verified" SET DEFAULT false;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';
  ALTER TABLE "users" ALTER COLUMN "banned" SET DEFAULT false;
  ALTER TABLE "passkeys" ALTER COLUMN "transports" SET NOT NULL;
  ALTER TABLE "api_keys" ALTER COLUMN "enabled" SET DEFAULT true;
  ALTER TABLE "api_keys" ALTER COLUMN "rate_limit_enabled" SET DEFAULT true;
  ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'member';
  ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending';
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "sessions_created_at_idx" ON "sessions" USING btree ("created_at");
  CREATE INDEX "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
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
  CREATE INDEX "invitations_team_idx" ON "invitations" USING btree ("team");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" RENAME COLUMN "active_organization_id" TO "active_organization";
  DROP INDEX "users_created_at_idx";
  DROP INDEX "users_updated_at_idx";
  DROP INDEX "sessions_created_at_idx";
  DROP INDEX "sessions_updated_at_idx";
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
  DROP INDEX "teams_created_at_idx";
  DROP INDEX "teams_updated_at_idx";
  DROP INDEX "invitations_email_idx";
  DROP INDEX "invitations_team_idx";
  ALTER TABLE "users" ALTER COLUMN "two_factor_enabled" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "is_anonymous" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "phone_number_verified" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "banned" DROP DEFAULT;
  ALTER TABLE "passkeys" ALTER COLUMN "transports" DROP NOT NULL;
  ALTER TABLE "api_keys" ALTER COLUMN "enabled" DROP DEFAULT;
  ALTER TABLE "api_keys" ALTER COLUMN "rate_limit_enabled" DROP DEFAULT;
  ALTER TABLE "members" ALTER COLUMN "role" DROP DEFAULT;
  ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT;`)
}
