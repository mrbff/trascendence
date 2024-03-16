import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from '@prisma/client';
import { GetUser } from './users.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor (
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

	@Post('signup')
	@ApiCreatedResponse()
	async create(@Body() createUserDto: CreateUserDto) {
	return await this.usersService.create(createUserDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async findAll() {
	const users = await this.usersService.findAll();
	return users;
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async findMe(@GetUser() user: User) {
	if (user !== null) {
		return user;
	} else {
		return null;
	}
	}

	@Get('NumberOfConnections')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async getNumberOfConnections(@GetUser() user: User) {
		return user.nbOfConnections;
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async findUser(@Param('id', ParseIntPipe) id: number){
		return await this.usersService.findOne(id);
	}

	@Get('basic/:username')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async findUserPublicData(@Param('username') username: string) {
	return await this.usersService.findUserPublicData(username);
	}

 @Get('nothrow/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async findUserPublicDataNoThrow(@Param('username') username: string) {
    const data = await this.usersService.findUserPublicDataNoThrow(username);
    if (data == null){
      throw new NotFoundException("No user found with username: " + username);
    }
    return data;
  }
  
  @Get('promise/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async findUserPublicDataPromise(@Param('username') username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
  
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      img: user.img,
      isOnline: user.isOnline,
      isPlaying: user.isPlaying,
      Wins: user.Wins,
      Losses: user.Losses,
      played: user.Played,
    };
  }
  
	@Patch('NumberOfConnections')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async updateNumberOfConnections(
	@GetUser() user: User,
	@Body('newConnections') newConnections: string,
	) {
		try {
			return await this.usersService.updateNumberOfConnections(user.id, newConnections);
		} catch (error) {
			console.log('auth error - ');
			return null;
		}
	}
	
	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async update(
		@GetUser() user: User,
		@Param('id', ParseIntPipe) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		if (user.id == id) {
		return await this.usersService.update(id, updateUserDto);
		}
	}

	@Patch('img/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async updateImg(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body() newImg: any,
	) {
		if (user.id == id) {
			return await this.usersService.updateImg(id, newImg.newImg);
		}
	}



	@Patch('online/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async updateOnline(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body() newStatus: any,
	) {
	if (user.id == id) {
		return await this.usersService.updateOnline(id, newStatus.newStatus);
	}
	}

	@Patch('is-playing/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async updateIsPlaying(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body() newStatus: any,
	) {
	if (user.id == id) {
		return await this.usersService.updateIsPlaying(id, newStatus.newStatus);
	}
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async remove(@GetUser() user: User, @Param('id', ParseIntPipe) id: number) {
	if (id == user.id) {
		return await this.usersService.remove(id);
	}
	}

	@Post('2fa-generate')
	@UseGuards(JwtAuthGuard)
	@ApiOkResponse()
	async generateTwoFactorSecret(
	@GetUser() user: User,
	@Body('userId') userId: string,
	) {
	const id: number = Number(userId);
	if (user.id == id) {
		return { url: await this.usersService.generateTwoFactorSecret(id) };
	}
	}

	@Patch('2fa-status/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async change2faStatu(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body('newStatus') newStatus: boolean,
	) {
	if (user.id == id) {
		return await this.usersService.update2faStatus(id, newStatus);
	}
	}

	@Get('2fa-qr')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async get2faQr(@GetUser() user: User) {
	return user.qrcode2fa;
	}

	@Patch('win-loss/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async updateRatio(
	@GetUser() user: User,
	@Param('id', ParseIntPipe) id: number,
	@Body('update') update: {res: string, matchId: number},)
	{
		if (user.id == id)
			return await this.usersService.updateWinLoss(id, update);
	}

	@Get('matchHistory/:id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse()
	async getMatchHistory(@Param('id', ParseIntPipe) id: number) {
	  const matchHistory = await this.usersService.getMatchHistory(id);
	  return matchHistory;
	}

  @Get('user-messages')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse()
  async getUserMessages(
    @GetUser() user: User,
  ) {
    const userMessages = await this.prisma.message.findMany({
        where: {
          senderId: user.id,
        },
        orderBy: {
          time: 'desc', // 'asc' for ascending order
        },
      });

      return userMessages;
  }

}
