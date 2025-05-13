/*
  Warnings:

  - You are about to drop the column `carrier` on the `claims` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "claims" DROP COLUMN "carrier",
ADD COLUMN     "insurance_company" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "property_address" TEXT NOT NULL DEFAULT 'not provided',
ADD COLUMN     "type_of_damage" TEXT NOT NULL DEFAULT 'not provided',
ALTER COLUMN "adjuster" SET DEFAULT 'unknown',
ALTER COLUMN "policy_number" SET DEFAULT 'unknown';
