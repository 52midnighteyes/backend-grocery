-- AlterTable
ALTER TABLE "store" ADD COLUMN     "domestic_id" INTEGER;

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_domestic_id_fkey" FOREIGN KEY ("domestic_id") REFERENCES "domestic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
