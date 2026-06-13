-- AlterTable
ALTER TABLE "address" ADD COLUMN     "domestic_id" INTEGER;

-- CreateTable
CREATE TABLE "domestic" (
    "id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "province_name" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "district_name" TEXT NOT NULL,
    "subdistrict_name" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,

    CONSTRAINT "domestic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_domestic_id_fkey" FOREIGN KEY ("domestic_id") REFERENCES "domestic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
