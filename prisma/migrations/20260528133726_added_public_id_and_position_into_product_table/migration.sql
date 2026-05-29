/*
  Warnings:

  - Added the required column `position` to the `product_image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "variant" TEXT;

-- AlterTable
ALTER TABLE "product_image" ADD COLUMN     "position" INTEGER NOT NULL,
ADD COLUMN     "public_id" TEXT;
