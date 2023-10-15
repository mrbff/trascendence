//src/auth/auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import { roundsOfHashing } from 'src/users/users.module';
import { Observable, map, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import querystring from 'querystring';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private usersService: UsersService
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const bcrypt = require('bcryptjs');
    let hashedPass = await bcrypt.hash(password, roundsOfHashing);
    const isPasswordValid = bcrypt.compare(user.hash, hashedPass);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      username: user.username,
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async login42(profile: any): Promise<any> {
  
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        username: profile.login,
        password: 'culocalo',
      });
    }
    user.img = profile.image.link;
    //TO DO update
    return {
      username: user.username,
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async exchangeCodeForAccessToken(code: string): Promise<any> {
    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append(
      'client_id',
      'u-s4t2ud-7cad452637e7c977d04ac2f73be9b8572561822551f214cc53608c09b230a9df',
    );
    formData.append(
      'client_secret',
      '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',
    );
    formData.append('code', code);
    formData.append('redirect_uri', 'http://localhost:8080/login');

    const response = await firstValueFrom(
      this.httpService.post('https://api.intra.42.fr/oauth/token', formData),
    );
    return response.data;
  }

  async fetch42Profile(accessToken: string): Promise<any> {
    const url = 'https://api.intra.42.fr/v2/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
  
    const response = await lastValueFrom(
      this.httpService.get(url, { headers }),
    );

    return response.data;
  }
}
