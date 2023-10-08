/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `audit_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `role` on the `users_teams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "user_team_role" AS ENUM ('owner', 'editor', 'viewer');

-- CreateEnum
CREATE TYPE "user_global_role" AS ENUM ('user', 'moderator', 'admin');

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_user_id_fkey";

-- AlterTable
ALTER TABLE "email_verification" ALTER COLUMN "email" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "role" "user_global_role" NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "users_teams" DROP COLUMN "role",
ADD COLUMN     "role" "user_team_role" NOT NULL;

-- DropTable
DROP TABLE "audit_log";

-- DropTable
DROP TABLE "contact";

-- DropEnum
DROP TYPE "team_role";

-- DropEnum
DROP TYPE "user_role";

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "table_name" VARCHAR NOT NULL,
    "entity_id" VARCHAR NOT NULL,
    "old_value" VARCHAR NOT NULL,
    "new_value" VARCHAR NOT NULL,
    "changed_by" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "email" VARCHAR NOT NULL,
    "phone" VARCHAR,
    "content" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
