/*
  Warnings:

  - Made the column `code` on table `voucher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "voucher" ALTER COLUMN "code" SET NOT NULL;
