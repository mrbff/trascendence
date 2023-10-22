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

  async acceptFriendRequest(userId: number, friendName: string) : Promise<any> {
    
    const sender = await this.prisma.user.findUniqueOrThrow({ where: {username: friendName}});

/*  TO DO
    check if user is blocked
*/
    return await this.prisma.friendship.update({
      where: {
        senderId_receiverId: {
          senderId: sender.id, 
          receiverId: userId
        }
      },
      data: {
        status: 'ACCEPTED'
      }
    });
  }

  async removeFriendship(senderId: number, receiverId: number): Promise<void> {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });
  }

  async getReceivedFriendRequests(userId: number): Promise<any> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            img: true,
            isOnline: true,
            isPlaying: true
          }
        }
      }
    });

    const friendRequests = friendships.map(friendship => friendship.sender);
    return friendRequests;
  }

  async getSentFriendRequests(userId: number): Promise<any> {
    const friendship = await this.prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            img: true,
            isOnline: true,
            isPlaying: true
          }
        }
      }
    });

    const friends = friendship.map(friendship => friendship.receiver);
    return friends;
  }

  async getFriends(userId: number): Promise<any> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'ACCEPTED' },
          { receiverId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            img: true,
            isOnline: true,
            isPlaying: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            img: true,
            isOnline: true,
            isPlaying: true
          }
        }
      }
    });

    const friends = friendships.map(friendship => {
      if (friendship.senderId === userId) {
        return friendship.receiver;
      } else {
        return friendship.sender;
      }
    });
    return friends;
  }

  async areUsersFriends(user1Id:number, user2Id: number): Promise<boolean> {
    let res = await this.prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId: user1Id, 
          receiverId: user2Id
        }
      }
    });
    if (res === null) {
      res = await this.prisma.friendship.findUnique({
        where: {
          senderId_receiverId: {
            senderId: user2Id, 
            receiverId: user1Id
          }
        }
      });
    }

    if (res === null)
      return false;
    return true;
  }

  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('You cannot block yourself');
    }
    if (await this.isUserBlocked(blockerId, blockedId)) {
      throw new Error('User already blocked');
    }
    if (await this.areUsersFriends(blockerId, blockedId)) {
      await this.removeFriendship(blockerId, blockedId);
    }

    await this.prisma.blockedUser.create({
      data: {
        blockerId: blockerId,
        blockedId: blockedId
      }
    });
  }

  async isUserBlocked(userId:number, otherId:number): Promise<boolean> {
    let res = await this.prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId, 
          blockedId: otherId
        }
      }
    });

    if (res === null)
      return false;
    return true;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    if (!(await this.isUserBlocked(blockerId, blockedId))) {
      throw new Error('User not blocked');
    }

    await this.prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: blockerId, 
          blockedId: blockedId
        }
      }
    });
  }

}