import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE IF EXISTS "jwks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "jwks" CASCADE;
  ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_jwks_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_jwks_id_idx";
  ALTER TABLE IF EXISTS "payload_locked_documents_rels" DROP COLUMN IF EXISTS "jwks_id";`);
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "jwks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_key" varchar NOT NULL,
  	"private_key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jwks_id" integer;
  CREATE INDEX IF NOT EXISTS "jwks_public_key_idx" ON "jwks" USING btree ("public_key");
  CREATE INDEX IF NOT EXISTS "jwks_updated_at_idx" ON "jwks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "jwks_created_at_idx" ON "jwks" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jwks_fk" FOREIGN KEY ("jwks_id") REFERENCES "public"."jwks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_jwks_id_idx" ON "payload_locked_documents_rels" USING btree ("jwks_id");
  ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_token";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_expiration";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "salt";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "hash";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "_verified";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "_verificationtoken";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "login_attempts";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "lock_until";`);
}
