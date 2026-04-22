/*
  Warnings:

  - The values [VISITANTE] on the enum `VehicleType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ownerApartmentId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `visitEntryAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `visitingApartmentId` on the `Vehicle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apartmentId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apartmentId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('CARRO', 'MOTO');
ALTER TABLE "Vehicle" ALTER COLUMN "type" TYPE "VehicleType_new" USING ("type"::text::"VehicleType_new");
ALTER TABLE "VehicleRequest" ALTER COLUMN "type" TYPE "VehicleType_new" USING ("type"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_ownerApartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_visitingApartmentId_fkey";

-- DropIndex
DROP INDEX "Vehicle_ownerApartmentId_idx";

-- DropIndex
DROP INDEX "Vehicle_ownerApartmentId_key";

-- DropIndex
DROP INDEX "Vehicle_visitingApartmentId_idx";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "ownerApartmentId",
DROP COLUMN "visitEntryAt",
DROP COLUMN "visitingApartmentId",
ADD COLUMN     "apartmentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VisitorVehicle" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "blockNote" TEXT,
    "visitingApartmentId" TEXT NOT NULL,
    "visitEntryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitorVehicle_plate_key" ON "VisitorVehicle"("plate");

-- CreateIndex
CREATE INDEX "VisitorVehicle_plate_idx" ON "VisitorVehicle"("plate");

-- CreateIndex
CREATE INDEX "VisitorVehicle_visitingApartmentId_idx" ON "VisitorVehicle"("visitingApartmentId");

-- CreateIndex
CREATE INDEX "VisitorVehicle_isBlocked_idx" ON "VisitorVehicle"("isBlocked");

-- CreateIndex
CREATE INDEX "VisitorVehicle_visitEntryAt_idx" ON "VisitorVehicle"("visitEntryAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_apartmentId_key" ON "Vehicle"("apartmentId");

-- CreateIndex
CREATE INDEX "Vehicle_apartmentId_idx" ON "Vehicle"("apartmentId");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorVehicle" ADD CONSTRAINT "VisitorVehicle_visitingApartmentId_fkey" FOREIGN KEY ("visitingApartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorVehicle" ADD CONSTRAINT "VisitorVehicle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
