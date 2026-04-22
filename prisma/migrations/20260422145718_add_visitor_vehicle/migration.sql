/*
  Warnings:

  - You are about to drop the column `apartmentId` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerApartmentId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "VehicleType" ADD VALUE 'VISITANTE';

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_apartmentId_fkey";

-- DropIndex
DROP INDEX "Vehicle_apartmentId_idx";

-- DropIndex
DROP INDEX "Vehicle_apartmentId_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "apartmentId",
ADD COLUMN     "ownerApartmentId" TEXT,
ADD COLUMN     "visitEntryAt" TIMESTAMP(3),
ADD COLUMN     "visitingApartmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_ownerApartmentId_key" ON "Vehicle"("ownerApartmentId");

-- CreateIndex
CREATE INDEX "Vehicle_ownerApartmentId_idx" ON "Vehicle"("ownerApartmentId");

-- CreateIndex
CREATE INDEX "Vehicle_visitingApartmentId_idx" ON "Vehicle"("visitingApartmentId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerApartmentId_fkey" FOREIGN KEY ("ownerApartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_visitingApartmentId_fkey" FOREIGN KEY ("visitingApartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
