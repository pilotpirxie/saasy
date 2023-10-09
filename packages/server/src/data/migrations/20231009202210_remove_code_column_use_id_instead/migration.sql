/*
  Warnings:

  - You are about to drop the column `code` on the `email_verification` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `password_recovery` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "email_verification_user_id_code_idx";

-- AlterTable
ALTER TABLE "email_verification" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "password_recovery" DROP COLUMN "code";

-- CreateIndex
CREATE INDEX "email_verification_user_id_idx" ON "email_verification"("user_id");
