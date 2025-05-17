/*
  Warnings:

  - Added the required column `carrier` to the `claims` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "claims" ADD COLUMN     "carrier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "claim_id" TEXT;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;
