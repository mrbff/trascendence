import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { User } from "@prisma/client";
import { GetUser } from "src/users/users.decorator";

@Controller('friends')
@ApiTags('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}
  
  @Post('invite')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async inviteFriend(
    @GetUser() user: User,
    @Body('friend') friendName: string
  ) {
    this.friendsService.inviteFriend(user.id, friendName);
    return `Friend request correctly sent to ${friendName}`;
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async acceptFriendRequest(
    @GetUser() user: User,
    @Body('friend') friendName: string
  ) {
    this.friendsService.inviteFriend(user.id, friendName);
    return `Friend request correctly sent to ${friendName}`;
  }

}