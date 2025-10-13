/*
  Warnings:

  - You are about to drop the `CourseTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CourseTag" DROP CONSTRAINT "CourseTag_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseTag" DROP CONSTRAINT "CourseTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SkillTag" DROP CONSTRAINT "SkillTag_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SkillTag" DROP CONSTRAINT "SkillTag_tagId_fkey";

-- DropTable
DROP TABLE "public"."CourseTag";

-- DropTable
DROP TABLE "public"."SkillTag";

-- DropTable
DROP TABLE "public"."Tag";
