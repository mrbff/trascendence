-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isInvite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "img" SET DEFAULT 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
