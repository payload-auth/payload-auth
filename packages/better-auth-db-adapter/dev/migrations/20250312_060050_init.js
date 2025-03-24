import { sql } from "@payloadcms/db-postgres";

export async function up({ db, payload, req }) {
	await db.execute(sql`
   ALTER TABLE "user" DROP COLUMN IF EXISTS "reset_password_token";
  ALTER TABLE "user" DROP COLUMN IF EXISTS "reset_password_expiration";
  ALTER TABLE "user" DROP COLUMN IF EXISTS "salt";
  ALTER TABLE "user" DROP COLUMN IF EXISTS "hash";
  ALTER TABLE "user" DROP COLUMN IF EXISTS "login_attempts";
  ALTER TABLE "user" DROP COLUMN IF EXISTS "lock_until";`);
}

export async function down({ db, payload, req }) {
	await db.execute(sql`
   ALTER TABLE "user" ADD COLUMN "reset_password_token" varchar;
  ALTER TABLE "user" ADD COLUMN "reset_password_expiration" timestamp(3) with time zone;
  ALTER TABLE "user" ADD COLUMN "salt" varchar;
  ALTER TABLE "user" ADD COLUMN "hash" varchar;
  ALTER TABLE "user" ADD COLUMN "login_attempts" numeric DEFAULT 0;
  ALTER TABLE "user" ADD COLUMN "lock_until" timestamp(3) with time zone;`);
}
