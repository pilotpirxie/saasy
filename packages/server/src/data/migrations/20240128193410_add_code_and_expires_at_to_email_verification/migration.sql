/*
  Warnings:

  - Added the required column `code` to the `email_verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `email_verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_verification" ADD COLUMN     "code" VARCHAR NOT NULL,
ADD COLUMN     "expires_at" TIMESTAMP(6) NOT NULL;
