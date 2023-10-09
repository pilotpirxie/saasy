/*
  Warnings:

  - Added the required column `accepted` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "accepted" BOOLEAN NOT NULL;
