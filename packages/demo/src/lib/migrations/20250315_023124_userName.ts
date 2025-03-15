import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "users_username_idx";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "username";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "display_username";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "username" varchar NOT NULL;
  ALTER TABLE "users" ADD COLUMN "display_username" varchar NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" USING btree ("username");`)
}
