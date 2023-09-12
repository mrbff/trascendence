/*import { UsersService } from './users.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {} // Inject PrismaService

  async createUser(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}*/

import { PrismaService } from "src/prisma.service";
import { Users } from "./users.model";
import { ConflictException, Injectable } from "@nestjs/common";

@Injectable()
export class UsersService{

  constructor(private prisma: PrismaService){}

  async getAllUsers():Promise<Users[]>{
      return this.prisma.users.findMany()
  }

  async createUser(data:Users): Promise<Users> {
    const existing = await this.prisma.users.findUnique({
      where: {
        username: data.username
      }
    })

    if (existing) {
      throw new ConflictException('username already exists')
    }

    return this.prisma.users.create({
      data
    })
  }
} 