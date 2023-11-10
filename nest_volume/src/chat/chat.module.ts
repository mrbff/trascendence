import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway'; 
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [ChatGateway],
  imports: [UsersModule]
})
export class ChatModule {}
