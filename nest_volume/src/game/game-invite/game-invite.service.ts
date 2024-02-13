import {
	BadRequestException,
	Injectable,
	NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  
  @Injectable()
  export class InvitesService {
	constructor(private prisma: PrismaService,) {}
  
	async inviteFriend(userId: number, friendName: string) {
	  let receiver = null;
	  try {
		receiver = await this.prisma.user.findUniqueOrThrow({
		  where: { username: friendName },
		});
	  } catch (error) {
		throw new NotFoundException(`No user found with username: ${friendName}`);
	  }
  
	  if (userId === receiver.id) {
		throw new BadRequestException(
		  'You cannot send a friend request to yourself.',
		);
	  }
  
	  if (await this.areUsersInvites(userId, receiver.id)) {
		throw new BadRequestException(
		  `You and ${friendName} are already invites`,
		);
	  }
  
	//   if (await this.isUserBlocked(userId, receiver.id)) {
	// 	throw new BadRequestException('This user is blocked');
	//   }
  
	  await this.prisma.gameinvite.create({
		data: {
		  senderId: userId,
		  receiverId: receiver.id,
		  status: 'PENDING',
		},
	  });
	}
  
	async acceptInvite(userId: number, friendName: string): Promise<any> {
	  let sender = null;
	  try {
		sender = await this.prisma.user.findUniqueOrThrow({
		  where: { username: friendName },
		});
	  } catch (error) {
		throw new NotFoundException(`No user found with username: ${friendName}`);
	  }
  
	  let gameinvite = null;
	  try {
		gameinvite = await this.prisma.gameinvite.findUniqueOrThrow({
		  where: {
			senderId_receiverId: {
			  senderId: sender.id,
			  receiverId: userId,
			},
		  },
		});
	  } catch (error) {
		throw new NotFoundException(
		  `No friend request by ${friendName} was found`,
		);
	  }
	  if (gameinvite.status === 'ACCEPTED')
		throw new BadRequestException(
		  `You and ${friendName} are already invites`,
		);
  
	//   if (await this.isUserBlocked(userId, sender.id)) {
	// 	throw new BadRequestException('This user is blocked');
	//   }
  
	  return await this.prisma.gameinvite.update({
		where: {
		  senderId_receiverId: {
			senderId: sender.id,
			receiverId: userId,
		  },
		},
		data: {
		  status: 'ACCEPTED',
		},
	  });
	}
  
	async removeInviteship(senderId: number, receiverId: number): Promise<void> {
	  await this.prisma.gameinvite.deleteMany({
		where: {
		  OR: [
			{ senderId: senderId, receiverId: receiverId },
			{ senderId: receiverId, receiverId: senderId },
		  ],
		},
	  });
	}
  
	async getReceivedInvite(userId: number): Promise<any> {
	  const gameinvites = await this.prisma.gameinvite.findMany({
		where: {
		  receiverId: userId,
		  status: 'PENDING',
		},
		include: {
		  sender: {
			select: {
			  id: true,
			  username: true,
			  img: true,
			  isOnline: true,
			  isPlaying: true,
			},
		  },
		},
	  });
	  console.log(gameinvites);
	  const friendRequests = gameinvites.map((gameinvite) => gameinvite.sender);
	  return friendRequests;
	}
  
	async getSentInvite(userId: number): Promise<any> {
	  const gameinvite = await this.prisma.gameinvite.findMany({
		where: {
		  senderId: userId,
		  status: 'PENDING',
		},
		include: {
		  receiver: {
			select: {
			  id: true,
			  username: true,
			  img: true,
			  isOnline: true,
			  isPlaying: true,
			},
		  },
		},
	  });
  
	  const invites = gameinvite.map((gameinvite) => gameinvite.receiver);
	  return invites;
	}
  
	async getInvites(userId: number): Promise<any> {
	  let gameinvites = await this.prisma.gameinvite.findMany({
		where: {
		  OR: [
			{ senderId: userId, status: 'ACCEPTED' },
			{ receiverId: userId, status: 'ACCEPTED' },
		  ],
		},
		include: {
		  sender: {
			select: {
			  id: true,
			  username: true,
			  img: true,
			  isOnline: true,
			  isPlaying: true,
			},
		  },
		  receiver: {
			select: {
			  id: true,
			  username: true,
			  img: true,
			  isOnline: true,
			  isPlaying: true,
			},
		  },
		},
	  });
  
	  const invites = gameinvites.map((gameinvite) => {
		if (gameinvite.senderId === userId) {
		  return gameinvite.receiver;
		} else {
		  return gameinvite.sender;
		}
	  });
	  return invites;
	}
  
	async areUsersInvites(user1Id: number, user2Id: number): Promise<boolean> {
	  let res = await this.prisma.gameinvite.findUnique({
		where: {
		  senderId_receiverId: {
			senderId: user1Id,
			receiverId: user2Id,
		  },
		},
	  });
	  if (res === null) {
		res = await this.prisma.gameinvite.findUnique({
		  where: {
			senderId_receiverId: {
			  senderId: user2Id,
			  receiverId: user1Id,
			},
		  },
		});
	  }
  
	  if (res === null) return false;
	  return true;
	}
  

  }
  