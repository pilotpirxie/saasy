/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `refresh_token_secret_key` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "refresh_token",
ADD COLUMN     "refresh_token_secret_key" VARCHAR NOT NULL;
