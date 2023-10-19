import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { roundsOfHashing } from './users.module';
import { TwoFactorAuthService } from '../auth/two-factor-auth/two-factor-auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const bcrypt = require('bcryptjs');

    const pwHash = await bcrypt.hash(createUserDto.password, roundsOfHashing);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        hash: pwHash,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const bcrypt = require('bcryptjs');
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    return this.prisma.user.update({ where: { id: id }, data: updateUserDto });
  }

  async updateImg(id: number, newImg: string) {
    return this.prisma.user.update({ where: { id: id }, data: { img: newImg } });
  }

  async updateOnline(id: number, newStatus: boolean) {
    return this.prisma.user.update({
      where: { id: id },
      data: { isOnline: newStatus },
    });
  }

  async updateIsPlaying(id: number, newStatus: boolean) {
    return this.prisma.user.update({
      where: { id: id },
      data: { isPlaying: newStatus },
    });
  }

  async update2faStatus(id: number, newStatus: boolean) {
    return this.prisma.user.update({
      where: { id: id },
      data: { is2faEnabled: newStatus },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async generateTwoFactorSecret(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(`No user found.`);
    }

    const { secretKey, otpauthUrl } =
      this.twoFactorAuthService.generateTwoFactorSecret();
      const qrUrl = await this.twoFactorAuthService.getTwoFactorAuthenticationCode(secretKey);
      await this.prisma.user.update({
        where: { id: id },
        data: { secret2fa: secretKey, qrcode2fa: qrUrl },
      });
    return qrUrl;
  }

  async validateTwoFactorCode(id: number, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user == null || user.is2faEnabled == false || user?.secret2fa == null)
      return false;
    const secretKey = user?.secret2fa as string;
    return this.twoFactorAuthService.validateTwoFactorCode(secretKey, token);
  }
}
