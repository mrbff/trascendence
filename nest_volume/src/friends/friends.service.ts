import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FriendsService {
  constructor( private prisma: PrismaService ) {}

  async inviteFriend(userId: number, friendName: string) : Promise<any> {
    
    const receiver = await this.prisma.user.findUniqueOrThrow({ where: {username: friendName}});

    if (userId === receiver.id) {
      throw new BadRequestException('You cannot send a friend request to yourself.');
    }
/*  TO DO
    check if user is blocked
    check if the to users are already friends
*/
    await this.prisma.friendship.create({
      data: {
        senderId: userId,
        receiverId: receiver.id,
        status: 'PENDING'
      }
    });
  }
}