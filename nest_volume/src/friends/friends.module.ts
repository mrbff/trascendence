import { Module } from "@nestjs/common";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "./friends.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";
import { HttpModule } from "@nestjs/axios";
import { PrismaService } from "src/prisma/prisma.service";
import { TwoFactorAuthModule } from "src/auth/two-factor-auth/two-factor-auth.module";

@Module({
    controllers: [FriendsController],
    providers: [FriendsService, UsersService, PrismaService],
    imports: [UsersModule, PrismaModule, TwoFactorAuthModule],
    exports: [FriendsService],
  })
  export class FriendsModule {}