import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "verification_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"identifier" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "verification_tokens_id" integer;
  CREATE INDEX IF NOT EXISTS "verification_tokens_updated_at_idx" ON "verification_tokens" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "verification_tokens_created_at_idx" ON "verification_tokens" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_verification_tokens_fk" FOREIGN KEY ("verification_tokens_id") REFERENCES "public"."verification_tokens"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_verification_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("verification_tokens_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "verification_tokens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "verification_tokens" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_verification_tokens_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_verification_tokens_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "verification_tokens_id";`)
}
