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

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Post('42')
  @ApiOkResponse()
  async loginFortyTwo(@Body('code') code: string) : Promise<any> {
    const token42 = await this.authService.exchangeCodeForAccessToken(code);
    console.log(`\n\n ${token42.access_token} \n\n`);
    const profile42data = await this.authService.fetch42Profile(token42.access_token);
    return profile42data;
  }
  /*
  @Get('42')
  @UseGuards(AuthGuard('42'))
  async loginWithFortyTwo() {
    // Initiates the 42 OAuth2 login flow
  }

  @Post('callback')
  handleCallback(@Body('code') code: string) {
    return this.authService.exchangeCodeForAccessToken(code);
  }*/
}
