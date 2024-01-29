/*
  Warnings:

  - The values [KIKED] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'BANNED', 'MUTED', 'KICKED');
ALTER TABLE "ChannelMembership" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "UserStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isModer" BOOLEAN NOT NULL DEFAULT false;
