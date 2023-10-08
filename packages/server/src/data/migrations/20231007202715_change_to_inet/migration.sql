/*
  Warnings:

  - Changed the type of `ip_address` on the `sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `register_ip` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "ip_address",
ADD COLUMN     "ip_address" INET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "register_ip",
ADD COLUMN     "register_ip" INET NOT NULL;
