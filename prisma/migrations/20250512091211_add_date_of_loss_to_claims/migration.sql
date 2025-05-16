/*
  Warnings:

  - Added the required column `date_of_loss` to the `claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policy_number` to the `claims` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "claims_claim_number_key";

-- AlterTable
ALTER TABLE "claims" ADD COLUMN     "date_of_loss" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "policy_number" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "last_updated" DROP DEFAULT,
ALTER COLUMN "acv_status" DROP DEFAULT,
ALTER COLUMN "rcv_status" DROP DEFAULT,
ALTER COLUMN "depreciation_status" DROP DEFAULT,
ALTER COLUMN "mortgage_status" DROP DEFAULT;
