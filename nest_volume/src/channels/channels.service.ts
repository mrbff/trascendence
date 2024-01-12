import { Channel, User, UserRole } from '@prisma/client';
import { ChannelsController } from './channels.controller';
import { Injectable } from "@nestjs/common";
import { channel } from 'diagnostics_channel';
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
          img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
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
        user: { connect: { id: user.id } },
        channel: { connect: { id: channel.id } },
        role: 'MEMBER'
      }
    });
  }

  async createChannelMembership(user:User, channel:Channel, role: UserRole) {
    return this.prisma.channelMembership.create({
      data: {
        user: { connect: { id: user.id } },
        channel: { connect: { id: channel.id } },
        role: role
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

  async createNewPublicChannel(channelName: string, users: string[], creator: string) {
    let obJChannel;
    try {
      obJChannel = await this.createPublicChannel(channelName);
    } catch (error) {
      return null;
    }
    const objOwn = await this.usersService.findUserByName(creator);
    console.log('objChannel',{obJChannel});
    await this.createChannelMembership(objOwn, obJChannel, 'OWNER');
    const objUsers = await this.prisma.user.findMany({
      where: {
        username:{in:users}
      }
    });
    for (const user of objUsers) {
      await this.createChannelMembership(user, obJChannel, "MEMBER");
    }
    return {
      ...obJChannel,
      members:objUsers.map(user=>{
        return {
          username: user.username,
        }
      })
    }
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

  async createDirectMessage(receiverName: string, content: string, username: string) {
    const sender = await this.usersService.findUserByName(username);
    const receiver = await this.usersService.findUserByName(receiverName);
  
    // Check if the direct channel already exists
    let channel = await this.prisma.channel.findFirst({
      where: {
        type: "DIRECT",
        AND:[
          {
            members:{
              some:{
                userId:sender.id
              }
            }
          },
          {
            members:{
              some:{
                userId:receiver.id
              }
            }
          }
        ]
      },
    });
    if (!channel) {
      channel = await this.createDirect(username, receiverName);
    }
  
    return this.prisma.message.create({
      data: {
        channelId: channel.id,
        senderId: sender.id,
        content: content,
      },
    });
  }  

  async getChannelMsg(sender: string, receiver:string){;
    const senderUser = await this.usersService.findUserByName(sender);
    const receiverUser = await this.usersService.findUserByName(receiver);
  
    return await this.prisma.message.findMany({
      where:{

        channel:{
          AND:[
            {
              members:{
                some:{
                  userId:senderUser.id
                }
              }
            },
            {
              members:{
                some:{
                  userId:receiverUser.id
                }
              }
            }
          ]
        },
      },
      include:{
        sender: true
      }
    })
  }

  async getUserChannels(username: string){
    const user = await this.prisma.user.findFirst({
      where:{username}
    });
    if (!user){
      return null;
    }
    return await this.prisma.channel.findMany({
      where:{
        members:{
          some:{
            userId:user.id
          }
        },
      },
      include:{
        members: {
          include:{
            user: {
              select:{
                username: true
              }
            }
          }
        }
      }
    })
  }

}