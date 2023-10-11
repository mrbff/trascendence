import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FortyTwoStrategy } from './fortyTwo.strategy';
import { FortyTwoDto } from './dto/fortyTwo.dto';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('42')
  @ApiOkResponse()
  async loginFortyTwo(@Body('code') code: string): Promise<any> {
    const token42 = await this.authService.exchangeCodeForAccessToken(code);
    //  console.log(`\n\n ${token42.access_token} \n\n`);
    const profile42data = await this.authService.fetch42Profile(
      token42.access_token,
    );
    //  console.log(`\n\n ${profile42data.login}\n\n`);
    const entity = await this.authService.login42(profile42data);
    return entity;
  }
}
