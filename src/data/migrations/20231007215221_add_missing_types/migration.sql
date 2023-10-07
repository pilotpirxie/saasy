-- AlterTable
ALTER TABLE "audit_log" ALTER COLUMN "old_value" SET DATA TYPE VARCHAR,
ALTER COLUMN "new_value" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "configs" ALTER COLUMN "value" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "contact" ALTER COLUMN "content" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "plans" ALTER COLUMN "config" SET DATA TYPE JSON;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "config" SET DATA TYPE JSON;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar_url" DROP NOT NULL,
ALTER COLUMN "avatar_url" SET DATA TYPE VARCHAR;
