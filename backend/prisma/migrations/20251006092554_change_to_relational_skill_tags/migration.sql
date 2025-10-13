/*
  Warnings:

  - You are about to drop the column `tags` on the `Skill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Skill" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "public"."SkillTag" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SkillTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillTag_skillId_idx" ON "public"."SkillTag"("skillId");

-- CreateIndex
CREATE INDEX "SkillTag_tagId_idx" ON "public"."SkillTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTag_skillId_tagId_key" ON "public"."SkillTag"("skillId", "tagId");

-- AddForeignKey
ALTER TABLE "public"."SkillTag" ADD CONSTRAINT "SkillTag_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillTag" ADD CONSTRAINT "SkillTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
