/*
  Warnings:

  - You are about to drop the column `userId` on the `password_recovery` table. All the data in the column will be lost.
  - Added the required column `email` to the `password_recovery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "password_recovery" DROP CONSTRAINT "password_recovery_userId_fkey";

-- AlterTable
ALTER TABLE "password_recovery" DROP COLUMN "userId",
ADD COLUMN     "email" VARCHAR NOT NULL;

-- CreateIndex
CREATE INDEX "password_recovery_email_idx" ON "password_recovery"("email");

-- AddForeignKey
ALTER TABLE "password_recovery" ADD CONSTRAINT "password_recovery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
