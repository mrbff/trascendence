import { Body, Controller, Post, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';


@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async loginWithFortyTwo() {
    // Initiates the 42 OAuth2 login flow
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoCallback(@Req() req: Request) {
    // Handles the 42 OAuth2 callback
    const user = req.user;
  }
}