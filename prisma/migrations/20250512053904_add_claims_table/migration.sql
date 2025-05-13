-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claim_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Inspection Scheduled',
    "carrier" TEXT NOT NULL,
    "adjuster" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "policy_docs" TEXT,
    "damage_photos" TEXT[],
    "signed_forms" TEXT,
    "carrier_correspondence" TEXT,
    "acv_status" TEXT DEFAULT 'Pending',
    "rcv_status" TEXT DEFAULT 'Pending',
    "depreciation_status" TEXT DEFAULT 'Pending',
    "mortgage_status" TEXT DEFAULT 'Required',
    "user_id" TEXT NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claims_claim_number_key" ON "claims"("claim_number");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
