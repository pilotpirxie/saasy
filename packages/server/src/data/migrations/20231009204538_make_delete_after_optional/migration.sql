-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "delete_after" DROP NOT NULL;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "delete_after" DROP NOT NULL;
