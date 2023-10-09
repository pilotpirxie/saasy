/*
  Warnings:

  - You are about to drop the column `verified_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "verified_at",
ADD COLUMN     "email_verified_at" TIMESTAMP(6);
