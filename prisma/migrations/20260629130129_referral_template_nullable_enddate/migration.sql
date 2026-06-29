-- AlterTable
ALTER TABLE "user_voucher" ADD COLUMN     "expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "voucher" ALTER COLUMN "end_date" DROP NOT NULL;
