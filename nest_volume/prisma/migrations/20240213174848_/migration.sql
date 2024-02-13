/*
  Warnings:

  - Changed the type of `isInvite` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MessaInviteStatus" AS ENUM ('FALSE', 'PENDING', 'ACCEPTED', 'OUTDATED');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isInvite",
ADD COLUMN     "isInvite" "MessaInviteStatus" NOT NULL;
