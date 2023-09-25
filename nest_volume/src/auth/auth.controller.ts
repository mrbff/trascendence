import { AuthService } from './auth.service';
import { Body, Controller, Post , HttpCode, HttpStatus} from '@nestjs/common';
import { AuthDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
    
    constructor(private authService: AuthService) {}

    @Post('/local/signup')
    signupLocal(@Body() dto: AuthDto): Promise<Tokens> {
        this.authService.signupLocal(dto);
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
