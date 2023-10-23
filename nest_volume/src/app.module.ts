import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedirectionGateway } from './oauthRedirection/redirection.gateway';
import { FriendsController } from './friends/friends.controller';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, HttpModule, FriendsModule],
  controllers: [AppController],
  providers: [AppService, RedirectionGateway],
})
export class AppModule {}
