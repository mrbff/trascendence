import { Channel, User, UserRole } from '@prisma/client';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { UserStatus } from '@prisma/client';
import { userInfo } from 'os';


@Injectable()
export class ChannelsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async deleteAllChannels(){
    await this.prisma.message.deleteMany();
    await this.prisma.channelMembership.deleteMany();
    await this.prisma.channel.deleteMany();
    return true;
  }


  async muteUser(channelId: string, username: string) {
    const user = await this.usersService.findUserByName(username);
    return this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: user.id,
          channelId: channelId
        }
      },
      data:{
        muteEndTime: new Date(Date.now() + 1000 * 60 * 15)
      }
    });
  }

  async updateInviteStatus(channelId: string, id: number, sender: string, username: string) {
    console.log(`updateInviteStatus`, channelId, id, sender, username);
    const find = await this.prisma.message.findUnique({
      where:{
        id: id
      }
    });
    if (find?.isInvite === 'PENDING'){
      await this.prisma.message.update({
        where:{
          id: id
        },
        data:{
          isInvite: 'OUTDATED',
        }
      });
    }
    const other = await this.prisma.user.findUnique({ where:{ username: username }});
    const user = await this.prisma.user.findUnique({ where:{ username: sender }});
    await this.prisma.gameinvite.delete({
      where: {
        senderId_receiverId: {
        senderId: other!.id,
        receiverId: user!.id,
        },
      },
    });
  }

  async unMuteUser(channelId: string, username: string) {
    const user = await this.usersService.findUserByName(username);
    return this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: user.id,
          channelId: channelId
        }
      },
      data:{
        muteEndTime: null
      }
    });
  }

  async changeUserStatus(channelId: string, username: string, status: string | null) {
    const user = await this.usersService.findUserByName(username);
    const channel = await this.prisma.channel.findUnique({
      where:{
        id: channelId
      }
    });
    return this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: user.id,
          channelId: channel!.id
        }
      },
      data: {
        status: status as UserStatus | null
      }
    });
  }

  async changePassword(id: string, password: string, channelType: string) {
    return this.prisma.channel.update({
      where: {
        id: id,
      },
      data: {
        password: password,
        type: channelType as 'PRIVATE' | 'PUBLIC',
      },
    });
  }

  async createChannel(channelName:string, password:string, typo: string) {
    return this.prisma.channel.create({
        data: {
          type: typo as 'PRIVATE' | 'PUBLIC' | 'DIRECT',
          name: channelName,
          password: password,
          img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
        },
    });
  }

  async createMembership(user:User, channel:Channel, role: UserRole) {
    return this.prisma.channelMembership.create({
      data: {
        user: { connect: { id: user.id } },
        channel: { connect: { id: channel.id } },
        role: role,
        status: 'ACTIVE'
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
    const membership1 = await this.createMembership(user1, direct, "MEMBER");
    const membership2 = await this.createMembership(user2, direct, "MEMBER");
    return this.prisma.channel.update({
      where: {
        id: direct.id,
      },
      data: {
        lastSeen: [],
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

  async createNewChannel(channelName: string, users: string[], creator: string, groupType: string, password: string) {
    let obJChannel;

    if (groupType !== 'public') {
      obJChannel = await this.createChannel(channelName, password, "PRIVATE");
    } else {
      obJChannel = await this.createChannel(channelName, password, "PUBLIC");
    }
    const objOwn = await this.usersService.findUserByName(creator);
    await this.createMembership(objOwn, obJChannel, 'OWNER');
    const objUsers = await this.prisma.user.findMany({
      where: {
        username:{in:users}
      }
    });
    for (const user of objUsers) {
      await this.createMembership(user, obJChannel, "MEMBER");
    }

    const members = [
      ...objUsers.map(user => ({ username: user.username })),
      { username: objOwn.username }
    ];
  
    return {
      ...obJChannel,
      members: members,
    };
  }

  
  async createModChannelMessage(channelId:string, content:string, username:string) {
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        id: channelId
      }
    });
    
    const sender = await this.usersService.findUserByName(username);
    await this.prisma.channel.update({
      data:{
        lastSeen: []
      },
      where:{
        id: channelId
      }
    });
    return this.prisma.message.create({
      data: {
        senderId: sender.id,
        channelId: channel.id,
        content: content,
        isModer: true,
        isInvite: "FALSE"
      },
    });
  }

  async createInviteChannelMessage(channelId:string, content:string, username:string) {
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        id: channelId
      }
    });
    
    const sender = await this.usersService.findUserByName(username);
    await this.prisma.channel.update({
      data:{
        lastSeen: []
      },
      where:{
        id: channelId
      }
    });

    return this.prisma.message.create({
      data: {
        senderId: sender.id,
        channelId: channel.id,
        content: content,
        isInvite: "PENDING"
      },
    });
  }
  
  async createGameInvite(username: string, sender: string) {
    const user = await this.usersService.findUserByName(username);
    const receiver = await this.usersService.findUserByName(sender);
    const msg = await this.prisma.gameinvite.create({
      data: {
        senderId: user.id,
        receiverId: receiver.id,
        status: 'PENDING',
      },
    });
    return msg.id;
}

  async createChannelMessage(channelId:string, content:string, username:string) {
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        id: channelId
      }
    });

    const sender = await this.usersService.findUserByName(username);
    await this.prisma.channel.update({
      data:{
        lastSeen: []
      },
      where:{
        id: channelId
      }
    });
    return this.prisma.message.create({
      data: {
        senderId: sender.id,
        channelId: channel.id,
        content: content,
        isInvite: "FALSE"
      },
    });
    
  }

  async createDirectMessage(receiverName: string, content: string, username: string) {
    const sender = await this.usersService.findUserByName(username);
    const receiver = await this.usersService.findUserByName(receiverName);
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
    let newChannel = false;
    if (!channel) {
      newChannel = true;
      channel = await this.createDirect(username, receiverName);
    }
  
    await this.prisma.message.create({
      data: {
        channelId: channel.id,
        senderId: sender.id,
        content: content,
        isInvite: "FALSE"
      },
    });
    return {newChannel, 
      channel: {
        ...channel,
        members: [{username: sender.username }, {username: receiver.username}]
      }};
  }  

  async findDirChannel(sender : string, username : string) {
    const ch = await this.prisma.channel.findFirst({
      where: {
        type: "DIRECT",
        AND:[
          {
            members:{
              some:{
                user:{
                  username: sender
                }
              }
            }
          },
          {
            members:{
              some:{
                user:{
                  username: username
                }
              }
            }
          }
        ]
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
    });
  return ch;
  }

  async getChannelById(id: string){
    return await this.prisma.channel.findUnique({
      where:{
        id
      },
      include:{
        members: {
          include:{
            user: {
              select:{
                id: true,
                username: true,
                blockedUsers: true,
                  blockedBy: {
                    select:{
                      blocker:
                      {
                        select:{
                          username: true
                        }
                      }
                  }
                }
              },
            },
          },
        },
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
    const channel = await this.prisma.channel.findMany({
      where:{
        members:{
          some:{
            userId:user.id,
            status: "ACTIVE"
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
        },
        messages: {
          take: 1,
        }
      }
    });
    return channel;
  }

  async getLastSeen(id: string){
    const channel = await this.prisma.channel.findUnique({
      where:{
        id
      }
    });
    return channel?.lastSeen;
  }

  async getChannelMsgById(id: string){;
    return await this.prisma.message.findMany({
      where:{channelId: id},
      include:{
        sender: true,
      }
    })
  }

  async flagLastMessage(channelId: string, user: string) {
    try {
      const userObj = await this.usersService.findUserByName(user);
      const updatedChannel = await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          lastSeen: { push: userObj.username },
        },
      });
      return updatedChannel;
    } catch (error) {
        console.log('Failed to update channel last seen.');
      return null;
    }
  }
  

  async setOwner(channelId: string, user: string){
    const userObj = await this.usersService.findUserByName(user);
    return await this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      },
      data:{
        role: "OWNER",
      }
    });
  }

  async setAdmin(channelId: string, user: string){
    const userObj = await this.usersService.findUserByName(user);
    return await this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      },
      data:{
        role: "ADMIN",
      }
    });
  }


  async rmAdmin(channelId: string, username: string){
    const userObj = await this.usersService.findUserByName(username);
    return await this.prisma.channelMembership.update({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      },
      data:{
        role: "MEMBER",
      }
    });
  }

  async rmChannel(channelId: string){
    await this.prisma.channelMembership.deleteMany({
      where:{
        channelId
      }
    });
    await this.prisma.message.deleteMany({
      where:{
        channelId
      }
    });
    return await this.prisma.channel.delete({
      where:{
        id: channelId
      }
    });
  }


  async rmUserFromChannel(channelId: string, username: string){
    const userObj = await this.usersService.findUserByName(username);
    await this.prisma.channelMembership.delete({
      where:{
        userId_channelId:{
          userId: userObj.id,
          channelId: channelId
        }
      }
    });
    const ch = await this.prisma.channel.findUnique({
      where:{
        id: channelId
      },
      include:{
        members: true
      }
    });
    if (!ch?.members.find((member) => member.status === 'ACTIVE')){
      await this.prisma.channelMembership.deleteMany({
        where:{
          channelId: channelId,
        }
      });
      await this.prisma.message.deleteMany({
        where:{
          channelId: channelId
        }
      });
      await this.prisma.channel.delete({
        where:{
          id: channelId
        }
      });
      return;
    }
  }

  async addUsersToChannel(channelId: string, username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: username,
        },
      });
  
      if (!user) {
        console.error(`User with username ${username} not found.`);
        return;
      }
  
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
      });
  
      if (!channel) {
        console.error(`Channel with ID ${channelId} not found.`);
        return;
      }
  
      await this.createMembership(user, channel, 'MEMBER');
      return await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
      });
    } catch (error: any) {
      console.error(error);
    }
  }
  
}