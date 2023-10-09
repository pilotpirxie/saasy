/*
  Warnings:

  - Changed the type of `accepted` on the `invitations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "accepted",
ADD COLUMN     "accepted" TIMESTAMP(6) NOT NULL;
