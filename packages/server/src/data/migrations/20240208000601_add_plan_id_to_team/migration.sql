/*
  Warnings:

  - Added the required column `plan_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "plan_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
