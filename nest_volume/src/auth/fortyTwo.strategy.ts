import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { UsersService } from '../users/users.service';
import { roundsOfHashing } from 'src/users/users.module';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly usersService: UsersService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/42/callback',
      scope: 'public',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const existingUser = await this.usersService.findOneByEmail(profile.email);

    if (existingUser) {
        return existingUser;
    } else {
        const bcrypt = require('bcryptjs');
        let hashedPass = await bcrypt.hash(profile.password, roundsOfHashing);
        const newUser = await this.usersService.create({
            email: profile.email,
            username: profile.username,
            password: hashedPass
        });
        return newUser;
    }
  }
}