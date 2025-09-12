/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supabaseId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropColumn
ALTER TABLE "User" DROP COLUMN "password";

-- AddColumn
ALTER TABLE "User" ADD COLUMN "supabaseId" TEXT NOT NULL;

-- Make email optional again (since Supabase handles email verification)
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- Add index for supabaseId
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");