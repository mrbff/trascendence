// src/users/entities/user.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @Exclude()
  hash: string;

  @Exclude()
  hashedRt: string | null;
  
  @ApiProperty()
  img: string;
  
  @ApiProperty()
  isOnline:              boolean;
  
  @ApiProperty()
  isPlaying:             boolean;
  
  @ApiProperty()
  Wins:                  number;
  
  @ApiProperty()
  Losses:                number;

  @ApiProperty()
  is2faEnabled:          boolean;
  
  @Exclude()
  emailVerificationCode: string | null;
}
