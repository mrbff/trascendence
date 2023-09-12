import { UserService } from './../../../angular_volume/src/app/core/services/user.service';
/*import { UsersModule } from './users.module';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  controllers: [],
})
export class UsersModule {}*/

import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller";
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService]
})
export class UsersModule{}
