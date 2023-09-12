/*import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from "@nestjs/jwt";
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUsersDto } from './dto/register-user.dto';
import { Users } from 'src/users/users.model';

@Injectable()
export class AuthService {
  constructor (
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly usersService: UsersService) {}

  async login (loginDto: LoginDto):Promise<any> {
    const {username, password} = loginDto;

    const users = await this.prismaService.users.findUnique({
      where: {username}
    })

    if (!users) {
      throw new NotFoundException('user not found')
    }

    const validatePassword = await bcrypt.compare(password, users.password)

    if (!validatePassword) {
      throw new NotFoundException('invalid password')
    }

    return {
      token: this.jwtService.sign({username})
    }
  }

  async register (createDto: RegisterUsersDto): Promise<any> {
    const createUsers = new Users()
    createUsers.username = createUsers.username
    createUsers.email = createUsers.email
    createUsers.password = await bcrypt.hash(createDto.password, 10)
    
    const user = await this.usersService.createUser(createUsers)

    return {
      token: this.jwtService.sign({username: user.username})
    }
  }
}

