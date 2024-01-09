-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "plan" SET DEFAULT 'PRO';

-- CreateIndex
CREATE INDEX "Answer_storageUsed_idx" ON "Answer"("storageUsed");
