-- CreateIndex
CREATE INDEX "Course_difficulty_idx" ON "public"."Course"("difficulty");

-- CreateIndex
CREATE INDEX "Course_isPaid_idx" ON "public"."Course"("isPaid");

-- CreateIndex
CREATE INDEX "Course_rating_idx" ON "public"."Course"("rating");

-- CreateIndex
CREATE INDEX "Course_language_idx" ON "public"."Course"("language");

-- CreateIndex
CREATE INDEX "Course_createdAt_idx" ON "public"."Course"("createdAt");

-- CreateIndex
CREATE INDEX "Skill_parentId_idx" ON "public"."Skill"("parentId");

-- CreateIndex
CREATE INDEX "Skill_name_idx" ON "public"."Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_slug_idx" ON "public"."Skill"("slug");

-- CreateIndex
CREATE INDEX "UserSkill_proficiency_idx" ON "public"."UserSkill"("proficiency");

-- CreateIndex
CREATE INDEX "UserSkill_progress_idx" ON "public"."UserSkill"("progress");

-- CreateIndex
CREATE INDEX "UserSkill_lastPracticed_idx" ON "public"."UserSkill"("lastPracticed");
