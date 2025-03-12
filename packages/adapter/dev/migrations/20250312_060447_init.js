import { sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }) {
	await db.execute(sql`
   ALTER TABLE "account" RENAME COLUMN "user_id_id" TO "user_id";
  ALTER TABLE "session" RENAME COLUMN "user_id_id" TO "user_id";
  ALTER TABLE "account" DROP CONSTRAINT "account_user_id_id_user_id_fk";
  
  ALTER TABLE "session" DROP CONSTRAINT "session_user_id_id_user_id_fk";
  
  DROP INDEX IF EXISTS "account_user_id_idx";
  DROP INDEX IF EXISTS "session_user_id_idx";
  DO $$ BEGIN
   ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "account_user_idx" ON "account" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "session_user_idx" ON "session" USING btree ("user_id");`);
}

export async function down({ db, payload, req }) {
	await db.execute(sql`
   ALTER TABLE "account" DROP CONSTRAINT "account_user_id_user_id_fk";
  
  ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
  
  DROP INDEX IF EXISTS "account_user_idx";
  DROP INDEX IF EXISTS "session_user_idx";
  ALTER TABLE "account" ADD COLUMN "user_id_id" integer NOT NULL;
  ALTER TABLE "session" ADD COLUMN "user_id_id" integer NOT NULL;
  DO $$ BEGIN
   ALTER TABLE "account" ADD CONSTRAINT "account_user_id_id_user_id_fk" FOREIGN KEY ("user_id_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "session" ADD CONSTRAINT "session_user_id_id_user_id_fk" FOREIGN KEY ("user_id_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("user_id_id");
  CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("user_id_id");
  ALTER TABLE "account" DROP COLUMN IF EXISTS "user_id";
  ALTER TABLE "session" DROP COLUMN IF EXISTS "user_id";`);
}
