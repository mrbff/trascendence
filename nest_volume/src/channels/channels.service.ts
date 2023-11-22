import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createPublicChannel(channelName:string) {
    return this.prisma.channel.create({
        data: {
          type: 'PUBLIC',
          name: channelName,
        },
    });
  }

  async createPrivateChannel(channelName:string, password:string) {
    return this.prisma.channel.create({
        data: {
          type: 'PRIVATE',
          name: channelName,
          password: password
        },
    });
  }

  async createDirectMembership(user:any, channel:any) {
    return this.prisma.channelMembership.create({
      data: {
        userId: user.id,
        user: user,
        channelId: channel.id,
        channel: channel,
        role: 'MEMBER'
      }
    });
  }

  async createMemberChannelMembership(user:any, channel:any) {
    return this.prisma.channelMembership.create({
      data: {
        userId: user.id,
        user: user,
        channelId: channel.id,
        channel: channel,
        role: 'MEMBER'
      }
    });
  }

  async createAdminChannelMembership(user:any, channel:any) {
    return this.prisma.channelMembership.create({
      data: {
        userId: user.id,
        user: user,
        channelId: channel.id,
        channel: channel,
        role: 'ADMIN'
      }
    });
  }

  async createOwnerChannelMembership(user:any, channel:any) {
    return this.prisma.channelMembership.create({
      data: {
        userId: user.id,
        user: user,
        channelId: channel.id,
        channel: channel,
        role: 'OWNER'
      }
    });
  }

  async createDirect(username1:string, username2:string) {
    const direct = await this.prisma.channel.create({
        data: {
          type: 'DIRECT',
        },
    });
    const user1 = await this.usersService.findUserByName(username1);
    const user2 = await this.usersService.findUserByName(username2);
    const membership1 = await this.createDirectMembership(user1, direct);
    const membership2 = await this.createDirectMembership(user2, direct);
    return this.prisma.channel.update({
      where: {
        id: direct.id,
      },
      data: {
        members: {
          connect: [
            { 
              userId_channelId: {
                userId: membership1.userId,
                channelId: direct.id
              }
            },
            { 
              userId_channelId: {
                userId: membership2.userId,
                channelId: direct.id
              }
            }
          ]
        },
      },
    });
  }

  async createChannelMessage(channelName:string, content:string, username:string) {
    ///TO DO: se non trova channel crealo
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        name: channelName
      }
    });

    const sender = await this.usersService.findUserByName(username);

    return this.prisma.message.create({
      data: {
        channelId: channel.id,
        senderId: sender.id,
        content: content
      },
    });
  }

  async createDirectMessage(receiverName:string, content:string, username:string) {
    const sender = await this.usersService.findUserByName(username);
    const receiver = await this.usersService.findUserByName(receiverName);
    ///TO DO: se non trova channel crealo
    const channel = await this.prisma.channel.findFirstOrThrow({
      where: {
        type: "DIRECT",
        members: {
          some: {
            AND: [
              { userId: sender.id },
              { userId: receiver.id },
            ],
          },
        },
      },
    });

    return this.prisma.message.create({
      data: {
        channelId: channel.id,
        senderId: sender.id,
        content: content
      },
    });
  }

}