-- AlterTable
ALTER TABLE "stock_history" ADD COLUMN     "admin_id" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "stock_after" INTEGER,
ADD COLUMN     "stock_before" INTEGER DEFAULT 0,
ADD COLUMN     "transaction_id" TEXT;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
