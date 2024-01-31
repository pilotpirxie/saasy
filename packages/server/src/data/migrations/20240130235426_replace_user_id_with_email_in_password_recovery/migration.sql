-- DropForeignKey
ALTER TABLE "password_recovery" DROP CONSTRAINT "password_recovery_user_id_fkey";

-- AlterTable
ALTER TABLE "password_recovery" ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "password_recovery" ADD CONSTRAINT "password_recovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
