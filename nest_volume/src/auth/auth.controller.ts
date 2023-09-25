import { AuthService } from './auth.service';
import { Body, Controller, Post , HttpCode, HttpStatus} from '@nestjs/common';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
    
    constructor(private authService: AuthService) {}

    @Post('/loca/signup')
    signupLocal(@Body() dto: AuthDto) {
        this.authService.signupLocal(dto);
    }

    @Post('/loca/signin')
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
