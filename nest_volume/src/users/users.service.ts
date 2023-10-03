import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 1;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const bcrypt = require("bcryptjs");

  //  let hash = bcrypt.hashSync(createUserDto.password, 10);
  
    let pwHash = bcrypt.hashSync(createUserDto.password, roundsOfHashing);
  //  console.log(pwHash);
    return this.prisma.user.create({
      data: { 
        username: createUserDto.username,
        email: createUserDto.email,
        hash: pwHash
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const bcrypt = require("bcryptjs");
    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, roundsOfHashing,);
    }
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
