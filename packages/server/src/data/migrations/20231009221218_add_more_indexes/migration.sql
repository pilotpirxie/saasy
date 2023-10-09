/*
  Warnings:

  - You are about to drop the column `code` on the `invitations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "invitations_invited_by_team_id_code_idx";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "code";

-- CreateIndex
CREATE INDEX "invitations_id_team_id_idx" ON "invitations"("id", "team_id");

-- CreateIndex
CREATE INDEX "invitations_team_id_idx" ON "invitations"("team_id");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");
