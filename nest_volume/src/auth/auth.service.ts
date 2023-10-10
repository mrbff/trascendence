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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    // Step 1: Fetch a user with the given email
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    // Step 2: Check if the password is correct
    const bcrypt = require('bcryptjs');
    let hashedPass = await bcrypt.hash(password, roundsOfHashing);
    const isPasswordValid = bcrypt.compare(user.hash, hashedPass);

    // If password does not match, throw an error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Step 3: Generate a JWT containing the user's ID and return it
    return {
      username: user.username,
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async login42(email: string): Promise<AuthEntity> {
  
    const user = await this.prisma.user.findUnique({ where: { email: email } });
 
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    
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

    console.log(response.data);
    return response.data;
  }
}
