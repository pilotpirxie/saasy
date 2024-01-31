/*
  Warnings:

  - Added the required column `code` to the `password_recovery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "password_recovery" ADD COLUMN     "code" VARCHAR NOT NULL;
