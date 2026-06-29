-- CreateTable
CREATE TABLE "user_voucher" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_voucher_user_id_idx" ON "user_voucher"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_voucher_user_id_voucher_id_key" ON "user_voucher"("user_id", "voucher_id");

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voucher" ADD CONSTRAINT "user_voucher_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
