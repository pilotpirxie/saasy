/*
  Warnings:

  - You are about to drop the column `exchange_code` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `exchanged_at` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "exchange_code",
DROP COLUMN "exchanged_at";
