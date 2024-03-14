import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetUser } from 'src/users/users.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('channels')
@ApiTags('channels')
export class ChannelsController {
  constructor (
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':channelId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannel(
    @GetUser() user: User,
    @Param('channelId') channelId: string,
  ) {
        let channel = await this.prisma.channel.findUniqueOrThrow({
            where: {
                id: channelId,
            }
        });

        if (channel.type == 'DIRECT')
        {
            const peerMembership = await this.prisma.channelMembership.findFirstOrThrow({
                where: {
                    channelId,
                    userId: {
                        not: user.id,
                    },
                },
            })
            const peer = await this.usersService.findOne(peerMembership.userId);
            channel.name = peer.username;
        }

        return channel;
  }

  @Get('getChannelByIds/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannelByIds(
    @Param('id') id: string,
  ) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: id,
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

  @Get(':channelsId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannelId(
    @GetUser() user: User,
    @Param('channelsId') channelId: string,
  ) {
        let channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
               members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return channel;
  }

  @Get('members/:channelId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getChannelMembers(
    @Param('channelId') channelId: string,
  ) {
        const channelMembers = await this.prisma.channelMembership.findMany({
            where: {
                channelId,
            },
            include: {
                user: true,
            },
        });
        
        return channelMembers;
    }

    @Get('getChatOrCreate/:username')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getChatOrCreate(
      @Param('username') username: string,
      @Query('otherusername') otherusername: string,
      @Query('type') type: string,
    ) {
      if (type === 'DIRECT') {
      try {
        const channel = await this.prisma.$transaction(async (prisma) => {
          const existingChannel = await prisma.channel.findFirst({
            where: {
              type: type as 'DIRECT' | 'PUBLIC' | 'PRIVATE',
              AND: [
                {
                  members: {
                    some: {
                      user: {
                        username: username,
                      },
                    },
                  },
                },
                {
                  members: {
                    some: {
                    user: {
                      username: otherusername,
                    },
                    },
                  },
                },
              ],
            },
          });
          if (existingChannel) {
            if (existingChannel.lastSeen.find((seen) => seen === username)) {
              return { ...existingChannel, allRead: true };
            } else {
              return { ...existingChannel, allRead: false };
            }
          } else {
            const user = await prisma.user.findUnique({
              where: {
                username: username,
              },
            });
            const otherUser = await prisma.user.findUnique({
              where: {
                username: otherusername,
              },
            });
            const newChannel = await prisma.channel.create({
              data: {
                type: type as any,
              },
            });
            await prisma.channelMembership.create({
              data: {
                user: { connect: { id: user!.id } },
                channel: { connect: { id: newChannel.id } },
                status: 'ACTIVE',
                role: 'MEMBER',
              },
          });
          await prisma.channelMembership.create({
            data: {
              user: { connect: { id: otherUser!.id } },
              channel: { connect: { id: newChannel.id } },
              status: 'ACTIVE',
              role: 'MEMBER',
            },
          });
          return newChannel;
        }
        });
        return channel;
      } catch (error: any) {
        // Handle error
      }
      }
    }

    @Get('getChat/:username')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getDirectChat(
      @Param('username') username: string,
      @Query('otherusername') otherusername: string,
      @Query('type') type: string,
    ) {
      if (type === 'DIRECT') {
        try {
          const channel = await this.prisma.channel.findFirstOrThrow({
            where: {
              type: type as any,
              AND: [
                {
                  members: {
                    some: {
                      user: {
                        username: username,
                      },
                    },
                  },
                },
                {
                  members: {
                    some: {
                      user: {
                        username: otherusername,
                      },
                    },
                  },
                },
              ],
            },
          });
          return channel;
        } catch (error: any) {
          return null;
        }
      }
      if (type === "PUBLIC") {
        try {
          const channel = await this.prisma.channel.findFirstOrThrow({
            where: {
              type: type as any,
              name: otherusername,
            },
          });
          return channel;
        } catch (error: any) {
          return null;
        }
      }
    }

    @Get('getUserStaus/:channelId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async findChannelById(
      @Param('channelId') channelId: string,
      @Query('userId') userId: number,
    ) {
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
        include: {
          members: true,
          }
        });
      return channel?.members.find((member) => {

        if(member.userId == userId) {
          return member;
        }
        return null;
       });
    }


    @Get('getTypesOfRealation/:channelId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getTypesOfRealation(
      @Param('channelId') channelId: string,
      @Query('username') username: string,
    ) {
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          }
        },
      });
      if (!channel)
        return null;
      if (channel.type === 'DIRECT')
      {
        if (channel.members.length === 2)
        {
          const other = channel.members.find((member) => {
            if (member.user.username !== username)
            {
              return member.user.username;
            }
          });
          const blockMyInfos = await this.prisma.user.findUnique({
            where: {
              username: username,
            },
            include: {
              blockedBy: {
                include: {
                  blocked: {
                    select: {
                      username: true,
                    },
                  },
                  blocker: {
                    select: {
                      username: true,
                    },
                  },
                }
              },
              blockedUsers: {
                include: {
                  blocker: {
                    select: {
                      username: true,
                    },
                  },
                  blocked: {
                    select: {
                      username: true,
                    },
                  },
                }
              },
            },
          });
          const isBlocked = blockMyInfos?.blockedBy.find((block) => block.blocked.username === username && block.blocker.username === other?.user.username);
          const isBlocking = blockMyInfos?.blockedUsers.find((block) => block.blocker.username === username && block.blocked.username === other?.user.username);

          //console.log('blockedUsers', blockMyInfos?.blockedUsers);
          //console.log('blockedBy', blockMyInfos?.blockedBy);

          if (isBlocked) {
            return { type: 'BLOCKED' };
          }
          if (isBlocking) {
            return { type: 'BLOCKING' };
          }
        }
      }
      if (channel.type === 'PUBLIC' || channel.type === 'PRIVATE') {
        const member = channel.members.find((member) => member.user.username === username);
        if (member) {
          return { type: member.status, status: member.status, muteEndTime: member.muteEndTime };
        } else {
          return { type: 'KICKED' };
        }
      }
      return { type: 'NONE'};
    }

    @Get('getChannel/:chName')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async findChannelByName(
      @Param('chName') chName: string,
    ) {
      try {
        const channel = await this.prisma.channel.findFirstOrThrow({
        where: {
            name: chName,
            },
        });
        return channel;
        } catch (error: any) {
            return null;
        }
    }

    @Get('getUserList/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getUserList(
      @Param('id') id: string,
    ) {
        const channel = await this.prisma.channel.findUnique({
          where: {
            id: id,
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        });
        if (!channel)
          return null;
        const { usernames, status }: { usernames: string[], status?: any } = {
          usernames: channel.members.map((member) => member.user.username),
          status: channel.members.map((member) => member.status)
        };
        return { usernames, status };
    }

    @Get('getInChannelById/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getInChannelById(
      @Param('id') id: string,
      @Query('username') username: string,
    ) {
        const channel = await this.prisma.channel.findUnique({
          where: {
            id: id,
          },
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        });
        if (!channel)
          return null;
          const { usernames, status }: { usernames: string[], status?: any } = {
            usernames: channel.members
              .filter((member) => member.status !== 'BANNED') // Filter out members with status 'BANNED'
              .map((member) => member.user.username),
            status: channel.members
              .filter((member) => member.status !== 'BANNED') // Filter out members with status 'KICKED'
              .map((member) => member.status)
          };
        return {result: usernames.find((user) => user === username) ? true : false};
    }

    @Get('fullUsersList/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getFullUsersList(
      @Param('id') id: string,
    ) {
      const users = await this.prisma.user.findMany({
        select: {
          username: true,
        },
      });
      const userList = users.map((user) => user.username);
      return userList;
    }

    @Get('getPasswordChannel/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getPasswordChannel(
      @Param('id') id: string,
    ) {
      const channel = await this.prisma.channel.findUnique({
        where: {
          id: id,
        },
      });
      return { password: channel?.password ?? '', type: channel?.type ?? 'PRIVATE' };
    }

    @Get('getMessagesPenidng/:empty')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getMessagesPenidng(
      @Param('empty') empty: null,
    ) {
      const messages = await this.prisma.message.findMany({
        where: {
          isInvite: 'PENDING',
        },
        include: {
          sender: {
            select: {
              username: true,
            },
          },
        }
      });
      return messages;
    }

    @Get('user/:user')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async getUser(
      @Param('user') user: string,
    ) {
      const userInfo = await this.prisma.user.findUnique({
        where: {
          username: user,
        },
      });
      return userInfo;
    }

    @Patch('changeGameStatus/:gameId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse()
    async postChangeGameStatus(
      @Param('gameId') gameId: number,
      @Body ('status') inf: { status : string, msgId: number},
    ) {
      //console.log('changeGameStatus', gameId, inf.status, inf.msgId);
        await this.prisma.message.update({
          where: {
            id: inf.msgId,
          },
          data: {
            isInvite: 'ACCEPTED',
          },
        });
      //   return { status: 'OK' };
      // }
      return { status: 'ERROR' };
    }
}
