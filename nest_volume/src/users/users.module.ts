import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TwoFactorAuthService } from 'src/auth/two-factor-auth/two-factor-auth.service';

export const roundsOfHashing:number = Number(process.env.ROUNDS_OF_HASHING);

@Module({
  controllers: [UsersController],
  providers: [TwoFactorAuthService, UsersService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
