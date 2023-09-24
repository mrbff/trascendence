import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService) {}

    signupLocal(dto: AuthDto) {
    /*    const newUser = this.prisma.users.create({
            data: {
            }
        })*/
    }

    signinLocal() {}

    logout() {}

    refreshTokens() {}
}
