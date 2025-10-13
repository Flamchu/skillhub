-- AlterTable
ALTER TABLE "public"."Skill" ADD COLUMN     "category" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "public"."Skill"("category");
