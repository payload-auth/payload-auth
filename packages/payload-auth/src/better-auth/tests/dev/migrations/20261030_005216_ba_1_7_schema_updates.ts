import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teams" ADD COLUMN "member_count" numeric NOT NULL;
  ALTER TABLE "team_members" ADD COLUMN "membership_key" varchar;
  CREATE UNIQUE INDEX "team_members_membership_key_idx" ON "team_members" USING btree ("membership_key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "team_members_membership_key_idx";
  ALTER TABLE "teams" DROP COLUMN "member_count";
  ALTER TABLE "team_members" DROP COLUMN "membership_key";`)
}
