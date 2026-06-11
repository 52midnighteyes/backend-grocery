/*
  Warnings:

  - Made the column `slug` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'waitingConfirmation';

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "payment_proof" TEXT,
ADD COLUMN     "payment_proof_public_id" TEXT;
