/*
  Warnings:

  - Added the required column `store_id` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discount" ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "discount_history" ADD COLUMN     "buy_quantity" INTEGER,
ADD COLUMN     "discount_amount" INTEGER,
ADD COLUMN     "discount_name" TEXT,
ADD COLUMN     "discount_type" "DiscountType",
ADD COLUMN     "discount_value" INTEGER,
ADD COLUMN     "get_quantity" INTEGER,
ADD COLUMN     "product_id" TEXT,
ADD COLUMN     "store_id" TEXT,
ADD COLUMN     "transaction_item_id" TEXT;

-- AlterTable
ALTER TABLE "voucher" ADD COLUMN     "store_id" TEXT;

-- AlterTable
ALTER TABLE "voucher_history" ADD COLUMN     "delivery_voucher_amount" INTEGER,
ADD COLUMN     "delivery_voucher_code" TEXT,
ADD COLUMN     "delivery_voucher_discount_type" "VoucherDiscountType",
ADD COLUMN     "delivery_voucher_name" TEXT,
ADD COLUMN     "delivery_voucher_value" INTEGER,
ADD COLUMN     "store_id" TEXT,
ADD COLUMN     "voucher_code" TEXT,
ADD COLUMN     "voucher_discount_amount" INTEGER,
ADD COLUMN     "voucher_discount_type" "VoucherDiscountType",
ADD COLUMN     "voucher_discount_value" INTEGER,
ADD COLUMN     "voucher_name" TEXT;

-- CreateIndex
CREATE INDEX "discount_product_id_idx" ON "discount"("product_id");

-- CreateIndex
CREATE INDEX "discount_store_id_idx" ON "discount"("store_id");

-- CreateIndex
CREATE INDEX "discount_start_date_end_date_idx" ON "discount"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "discount_history_transaction_id_idx" ON "discount_history"("transaction_id");

-- CreateIndex
CREATE INDEX "discount_history_transaction_item_id_idx" ON "discount_history"("transaction_item_id");

-- CreateIndex
CREATE INDEX "discount_history_discount_id_idx" ON "discount_history"("discount_id");

-- CreateIndex
CREATE INDEX "discount_history_product_id_idx" ON "discount_history"("product_id");

-- CreateIndex
CREATE INDEX "discount_history_store_id_idx" ON "discount_history"("store_id");

-- CreateIndex
CREATE INDEX "voucher_store_id_idx" ON "voucher"("store_id");

-- CreateIndex
CREATE INDEX "voucher_start_date_end_date_idx" ON "voucher"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "voucher_history_store_id_idx" ON "voucher_history"("store_id");

-- CreateIndex
CREATE INDEX "voucher_history_voucher_id_idx" ON "voucher_history"("voucher_id");

-- CreateIndex
CREATE INDEX "voucher_history_delivery_voucher_id_idx" ON "voucher_history"("delivery_voucher_id");

-- CreateIndex
CREATE INDEX "voucher_history_transaction_id_idx" ON "voucher_history"("transaction_id");

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_history" ADD CONSTRAINT "voucher_history_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_history" ADD CONSTRAINT "discount_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_history" ADD CONSTRAINT "discount_history_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_history" ADD CONSTRAINT "discount_history_transaction_item_id_fkey" FOREIGN KEY ("transaction_item_id") REFERENCES "transaction_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
