import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ChatGateway } from './chat.gateway'; 
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { environment } from 'src/environment/environment';

@Module({
  providers: [ChatGateway, JwtStrategy],
  imports: [
  /*  PassportModule,
    JwtModule.register({
      secret: 'environment.jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),*/
    UsersModule
  ]
})
export class ChatModule {}
