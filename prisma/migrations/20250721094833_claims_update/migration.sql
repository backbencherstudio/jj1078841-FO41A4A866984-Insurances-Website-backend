/*
  Warnings:

  - The `agreeWithPolicy` column on the `claims` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "claims" DROP COLUMN "agreeWithPolicy",
ADD COLUMN     "agreeWithPolicy" BOOLEAN;
