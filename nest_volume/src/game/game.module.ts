import { Module } from '@nestjs/common';
import { PongGateway } from './game.gateway'; 
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [PongGateway],
  imports: [PrismaModule, UsersModule],
})
export class PongModule {}
