-- AlterTable
ALTER TABLE "public"."UserSkill" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationAttemptId" TEXT;

-- CreateTable
CREATE TABLE "public"."SkillVerificationQuestion" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "difficultyLevel" "public"."ProficiencyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillVerificationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SkillVerificationChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceText" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillVerificationChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SkillVerificationAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "earnedPoints" INTEGER NOT NULL DEFAULT 0,
    "achievedLevel" "public"."ProficiencyLevel",
    "passedVerification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillVerificationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SkillVerificationUserAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedChoices" TEXT[],
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillVerificationUserAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkillVerificationQuestion_skillId_idx" ON "public"."SkillVerificationQuestion"("skillId");

-- CreateIndex
CREATE INDEX "SkillVerificationQuestion_difficultyLevel_idx" ON "public"."SkillVerificationQuestion"("difficultyLevel");

-- CreateIndex
CREATE INDEX "SkillVerificationQuestion_order_idx" ON "public"."SkillVerificationQuestion"("order");

-- CreateIndex
CREATE INDEX "SkillVerificationChoice_questionId_idx" ON "public"."SkillVerificationChoice"("questionId");

-- CreateIndex
CREATE INDEX "SkillVerificationChoice_order_idx" ON "public"."SkillVerificationChoice"("order");

-- CreateIndex
CREATE INDEX "SkillVerificationAttempt_userId_idx" ON "public"."SkillVerificationAttempt"("userId");

-- CreateIndex
CREATE INDEX "SkillVerificationAttempt_skillId_idx" ON "public"."SkillVerificationAttempt"("skillId");

-- CreateIndex
CREATE INDEX "SkillVerificationAttempt_completedAt_idx" ON "public"."SkillVerificationAttempt"("completedAt");

-- CreateIndex
CREATE INDEX "SkillVerificationAttempt_achievedLevel_idx" ON "public"."SkillVerificationAttempt"("achievedLevel");

-- CreateIndex
CREATE INDEX "SkillVerificationUserAnswer_attemptId_idx" ON "public"."SkillVerificationUserAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "SkillVerificationUserAnswer_questionId_idx" ON "public"."SkillVerificationUserAnswer"("questionId");

-- CreateIndex
CREATE INDEX "UserSkill_isVerified_idx" ON "public"."UserSkill"("isVerified");

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationQuestion" ADD CONSTRAINT "SkillVerificationQuestion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationChoice" ADD CONSTRAINT "SkillVerificationChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."SkillVerificationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationAttempt" ADD CONSTRAINT "SkillVerificationAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationAttempt" ADD CONSTRAINT "SkillVerificationAttempt_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationUserAnswer" ADD CONSTRAINT "SkillVerificationUserAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."SkillVerificationAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SkillVerificationUserAnswer" ADD CONSTRAINT "SkillVerificationUserAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."SkillVerificationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
