/*
  Warnings:

  - You are about to drop the column `company` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `contractEnd` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `contractStart` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Client` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "company",
DROP COLUMN "contractEnd",
DROP COLUMN "contractStart",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;
