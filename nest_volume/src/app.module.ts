import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { RedirectionGateway } from './oauthRedirection/redirection.gateway';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, RedirectionGateway],
})
export class AppModule {}
