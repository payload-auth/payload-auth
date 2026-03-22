import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_users_role" ADD VALUE 'adminSuperAdmin';
  ALTER TYPE "public"."enum_admin_invitations_role" ADD VALUE 'adminSuperAdmin';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users_role" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'user');
  ALTER TABLE "users_role" ALTER COLUMN "value" SET DATA TYPE "public"."enum_users_role" USING "value"::"public"."enum_users_role";
  ALTER TABLE "admin_invitations" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "admin_invitations" ALTER COLUMN "role" SET DEFAULT 'admin'::text;
  DROP TYPE "public"."enum_admin_invitations_role";
  CREATE TYPE "public"."enum_admin_invitations_role" AS ENUM('admin', 'user');
  ALTER TABLE "admin_invitations" ALTER COLUMN "role" SET DEFAULT 'admin'::"public"."enum_admin_invitations_role";
  ALTER TABLE "admin_invitations" ALTER COLUMN "role" SET DATA TYPE "public"."enum_admin_invitations_role" USING "role"::"public"."enum_admin_invitations_role";`)
}
