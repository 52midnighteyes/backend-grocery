-- AlterTable
ALTER TABLE "transaction_item" ADD COLUMN     "requires_fulfillment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortage_quantity" INTEGER,
ADD COLUMN     "store_stock_at_order" INTEGER;
