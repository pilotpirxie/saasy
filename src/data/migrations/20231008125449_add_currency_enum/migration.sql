/*
  Warnings:

  - Made the column `content` on table `contacts` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `currency` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `referrals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currency` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "currency" AS ENUM ('pln', 'usd', 'eur', 'gbp', 'chf');

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "currency",
ADD COLUMN     "currency" "currency" NOT NULL;
