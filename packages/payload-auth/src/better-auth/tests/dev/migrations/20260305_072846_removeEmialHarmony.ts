import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_normalized_email_idx";
  ALTER TABLE "users" DROP COLUMN "normalized_email";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "normalized_email" varchar;
  CREATE UNIQUE INDEX "users_normalized_email_idx" ON "users" USING btree ("normalized_email");`)
}
