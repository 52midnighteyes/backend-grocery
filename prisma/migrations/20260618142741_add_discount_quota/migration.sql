-- AlterTable
ALTER TABLE "discount" ADD COLUMN     "quota" INTEGER,
ADD COLUMN     "used_quota" INTEGER NOT NULL DEFAULT 0;
