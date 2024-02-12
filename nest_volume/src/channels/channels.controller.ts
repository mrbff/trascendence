import { PassportModule } from '@nestjs/passport';
import {
  ConsoleLogger,
  Controller,
  Get,
  Param,
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
          const blockOtherInfos = await this.prisma.user.findUnique({
            where: {
              username: other?.user.username,
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
            },
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
            },
          });
          const isBlockedByOther = blockOtherInfos?.blockedBy.find((block) => block.blocked.username === username);
          const isBlockingOther = blockOtherInfos?.blockedBy.find((block) => block.blocker.username === username);
          const isBlockedByMe = blockMyInfos?.blockedBy.find((block) => block.blocked.username === other?.user.username);
          const isBlockingMe = blockMyInfos?.blockedBy.find((block) => block.blocker.username === other?.user.username);

          if (isBlockedByOther || isBlockedByMe) {
            return { type: 'BLOCKED' };
          }
          if (isBlockingOther || isBlockingMe) {
            return { type: 'BLOCKING' };
          }
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
}
