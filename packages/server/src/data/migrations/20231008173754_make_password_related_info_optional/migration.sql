-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "salt" DROP NOT NULL,
ALTER COLUMN "iterations" DROP NOT NULL;
