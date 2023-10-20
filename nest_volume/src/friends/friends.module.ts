import { Module } from "@nestjs/common";
import { FriendsController } from "./friends.controller";
import { FriendsService } from "./friends.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    controllers: [FriendsController],
    providers: [FriendsService],
    imports: [PrismaModule],
    exports: [FriendsService],
  })
  export class UsersModule {}