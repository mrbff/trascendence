import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { InvitesService } from './game-invite.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/users/users.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('invites')
@ApiTags('invites')
export class InvitesController {
  constructor(
    private invitesService: InvitesService,
    private usersService: UsersService,
  ) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async inviteFriend(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    await this.invitesService.inviteFriend(user.id, friendName);
    return {okMessage: `request correctly sent to ${friendName}`};
  }

  @Patch('accept')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async acceptFriendRequest(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    await this.invitesService.acceptInvite(user.id, friendName);
    return {okMessage: `Now you and ${friendName} are invites`};
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async deleteFriend(
    @GetUser() user: User,
    @Body('friend') friendName: string,
  ) {
    const friend = await this.usersService.findUserByName(friendName);
    await this.invitesService.removeInviteship(user.id, friend.id);
    return {okMessage: `You removed your invites`};
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getInvites(@GetUser() user: User): Promise<any> {
    return await this.invitesService.getInvites(user.id);
  }

  @Get('requests/received')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getReceivedFriendRequests(@GetUser() user: User) {
    return await this.invitesService.getReceivedInvite(user.id);
  }

  @Get('requests/sent')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getSentFriendRequests(@GetUser() user: User) {
    return await this.invitesService.getSentInvite(user.id);
  }

//   @Get('blockeds')
//   @UseGuards(JwtAuthGuard)
//   @ApiOkResponse()
//   async getBlockeds(
//     @GetUser() user: User
//   ): Promise<any> {
//     return await this.invitesService.getBlockeds(user.id);
//   }
}
