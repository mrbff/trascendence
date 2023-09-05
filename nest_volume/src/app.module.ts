import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    AuthModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [PrismaService, UsersService, AppService, AuthService],
})
export class AppModule {}
