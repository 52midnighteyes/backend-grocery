/*
  Warnings:

  - You are about to drop the column `address` on the `store` table. All the data in the column will be lost.
  - You are about to drop the `user_address` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `stock_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `transaction_item` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_address" DROP CONSTRAINT "user_address_user_id_fkey";

-- AlterTable
ALTER TABLE "stock_history" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "store" DROP COLUMN "address";

-- AlterTable
ALTER TABLE "transaction_item" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "store_id" TEXT;

-- DropTable
DROP TABLE "user_address";

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT,
    "store_id" TEXT,
    "longitude" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "notes" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
