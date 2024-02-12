import { Module } from "@nestjs/common";
import { InvitesController } from "./game-invite.controller";
import { InvitesService } from "./game-invite.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "src/users/users.module";

@Module({
    controllers: [InvitesController],
    providers: [InvitesService],
    imports: [UsersModule, PrismaModule],
    exports: [InvitesService],
  })
  export class InvitesModule {}
