-- CreateEnum
CREATE TYPE "StockTransferStatus" AS ENUM ('pending', 'approved', 'rejected', 'received', 'cancelled');

-- AlterTable
ALTER TABLE "stock_history" ADD COLUMN     "stock_transfer_request_id" TEXT;

-- CreateTable
CREATE TABLE "stock_transfer_request" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "from_store_id" TEXT NOT NULL,
    "to_store_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "rejected_by_id" TEXT,
    "received_by_id" TEXT,
    "cancelled_by_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "StockTransferStatus" NOT NULL DEFAULT 'pending',
    "request_notes" TEXT,
    "response_notes" TEXT,
    "received_notes" TEXT,
    "cancelled_notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stock_transfer_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_transfer_request_product_id_idx" ON "stock_transfer_request"("product_id");

-- CreateIndex
CREATE INDEX "stock_transfer_request_from_store_id_idx" ON "stock_transfer_request"("from_store_id");

-- CreateIndex
CREATE INDEX "stock_transfer_request_to_store_id_idx" ON "stock_transfer_request"("to_store_id");

-- CreateIndex
CREATE INDEX "stock_transfer_request_status_idx" ON "stock_transfer_request"("status");

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_stock_transfer_request_id_fkey" FOREIGN KEY ("stock_transfer_request_id") REFERENCES "stock_transfer_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_from_store_id_fkey" FOREIGN KEY ("from_store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_to_store_id_fkey" FOREIGN KEY ("to_store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_request" ADD CONSTRAINT "stock_transfer_request_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
