import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
  } from '@nestjs/common';
  
  //import { Public, GetCurrentUserId, GetCurrentUser } from '../common/decorators';
  //import { RtGuard } from '../common/guards';
  import { AuthService } from './auth.service';
  import { AuthDto } from './dto';
  import { Tokens } from './types';
import { Public } from '@prisma/client/runtime/library';

@Controller('auth')
export class AuthController {
    
    constructor(private authService: AuthService) {}

    @Post('local/signup')
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        return this.authService.signupLocal(dto);
    }

    @Post('/local/signin')
    signinLocal() {
        this.authService.signinLocal();
    }

    @Post('/logout')
    logout() {
        this.authService.logout();
    }

    @Post('/refresh')
    refreshTokens() {
        this.authService.refreshTokens();
    }
}
