import { EventEmitter, Component, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Observable, Subscription, elementAt, interval, map, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendsService } from 'src/app/core/services/friends.service';
import { UserInfo } from 'src/app/models/userInfo.model';
import { MatDialog } from '@angular/material/dialog';
import { GameInviteComponent } from '../game-invite/game-invite.component';

class Pending {
  status: boolean = false;
  sender: string = '';
  reciver: string = '';
  time: number = 0;
}

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy{
	@Input() user!: any;
	@Input() pending!: Pending[];
	private $subs = new Subscription();
	public otherUsers!: UserInfo[];
	public isGroupChat: boolean = true;
	public myRole : string = 'MEMBER';
	public channelId: string = '';
	public channelName: string = '';
	public backPending: any
	
	attr: any;
	players: any[] = [];
	nowSelected: any;

	constructor(

		private readonly chatGateway: ChatGateway,
		private readonly router: Router,
		private readonly friendsService: FriendsService,
		private activatedRoute: ActivatedRoute,
		private dialog: MatDialog,
	  ) {
			this.players.push({ 
				id: '',
				name: 'No users in this channel',
				showMenu: false,
				role: 'EMPTY',
				isBlock: false,
				banOrKick: ''
			});
			this.nowSelected = null
	  }

	ngOnInit() {
		this.userList();
	}

	userList()
	{
		this.$subs.add(
			this.chatGateway.onChannelId().subscribe({
				next: (data: any) => {
					this.isGroupChat = true;
					if (data.channel.type === 'DIRECT'){
						this.isGroupChat = false;
					}
					this.otherUsers = [];
					this.players = [];
					this.channelId = data.channel.id;
					this.channelName = data.channel.name;
					for (let user of data.channel.members) {
						const username = user.user.username;
						const role = user.role;
						const id = user.user.id;
						const blockList = user.user.blockedBy;
						const banOrKick = user.status;
						const listable = true;
						let isBlock = false;
						let isMuted = false;
						
						if (user.muteEndTime > new Date().toISOString()) {
							isMuted = true;
						}
						for (let blockUser of blockList) {
							if (blockUser.blocker.username === this.user.username) {
								isBlock = true;
							}
						}
						if (username !== this.user.username && banOrKick !== 'KICKED' && banOrKick !== 'LEAVED'){
							if (this.channelName == null) {
								this.channelName = username;
							}
							this.players.push({ 
									id: id,
									name: username,
									showMenu: false,
									role: role,
									isBlock: isBlock,
									banOrKick: banOrKick,
									listable: listable,
									isMuted: isMuted,
									pending: false
								});
						}
						else if (username === this.user.username) {
							this.myRole = role;
							if (banOrKick !== 'ACTIVE') {
								this.players = [];
							}
						}
					}
					if (this.players.length === 0) {
						this.players.push({ 
							id: '',
							name: 'No users in this channel',
							showMenu: false,
							role: 'EMPTY',
							isBlock: false,
							banOrKick: ''
						});
					}
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.$subs.unsubscribe();
	}



		ngOnChanges(changes: SimpleChanges): void {
			if (JSON.stringify(changes['pending'].currentValue) != JSON.stringify(changes['pending'].previousValue)) {
			console.log(`-------------Pending changed---------------`);
			console.log('curr',changes['pending'].currentValue);
			console.log('prev', changes['pending'].previousValue);
			console.log(`---------------------------------`);
			this.pending = changes['pending'].currentValue;
			this.pendingInvite();
			}
		}


	pendingInvite(): void {
		let isFind = false;
			if (this.pending !== undefined) {
			isFind = this.pending.some((p: any) => {
				return p.sender === this.user.username && p.reciver === this.nowSelected.name;
			});
		}
		this.user.pending = isFind;
	}

	togglePlayerMenu(player: any): void {
		this.nowSelected = player;
		this.players.forEach((p) => (p.showMenu = false));
		player.showMenu = !player.showMenu;
		this.user = {...this.user, pending: false};
		this.pendingInvite();
	}

	profile(player: any): void {
		this.router.navigate(['/transcendence/profile', player.name]);
	}

	async DM(player: any): Promise<void> {
		if (this.isGroupChat) {
			const channel = await this.chatGateway.getChatOrCreate(this.user.username, player.name, "DIRECT");
			if(channel.allRead === false) {
				this.chatGateway.sendLastSeen(channel.id, this.user.username);
			}
			this.router.navigate(
				[], 
				{
					relativeTo: this.activatedRoute,
					queryParams: {id:channel.id},
				}
			);
		}
	}

	inviteToGame(player: any): void {
		const dialogRef = this.dialog.open(GameInviteComponent);
		dialogRef.afterClosed().subscribe(async (choise: string) => {
			if (choise)
			{
				let id = this.channelId;
				if(this.isGroupChat === true) {
					const ch = await this.chatGateway.getChatOrCreate(this.user.username, player.name, "DIRECT");
					id = ch.id;
				}
				this.chatGateway.sendInviteMsg(id, player.name, player.name);
				this.user.pending = true;
			}
			else
				console.error("Error creating invite");
		})

	}

	async block(player: any): Promise<void>{
		await this.friendsService
		.blockUser(player.name)
		.then(() => (player.isBlock = true));
	}

	async unblock(player: any): Promise<void> {
		await this.friendsService
		.unblockUser(player.name)
		.then(() => (player.isBlock = false));
	}

	async mute(player: any) {

		const dateObject = new Date(Date.now() + 1000 * 60 * 15);
		const hours = dateObject.getHours();
		const minutes = dateObject.getMinutes();
		const formattedTime = `${hours}:${minutes}`;

		this.chatGateway.sendModChannelMsg(`${player.name} has been MUTED from the channel by ${this.user.username} until ${formattedTime}`, this.channelId, player.name, 'ACTIVE');
		this.chatGateway.muteUser(this.channelId, player.name);
		player.isMuted = true;
	}

	async unmute(player: any) {
		this.chatGateway.sendModChannelMsg(`${player.name} has been UNMUTED from the channel by ${this.user.username}`, this.channelId, player.name, 'ACTIVE');
		this.chatGateway.unMuteUser(this.channelId, player.name);
		player.isMuted = false;
	}

	async kick(player: any): Promise<void> {
		this.chatGateway.sendModChannelMsg(`${player.name} has been KICKED from the channel by ${this.user.username}`, this.channelId, player.name, 'KICKED');
	}

	async ban(player: any) {
		this.chatGateway.sendModChannelMsg(`${player.name} has been BANNED from the channel by ${this.user.username}`, this.channelId, player.name, 'BANNED');
	}

	async unban(player: any) {
		this.chatGateway.sendModChannelMsg(`${player.name} has been UNBANNED from the channel by ${this.user.username}`, this.channelId, player.name, 'KICKED');
	}

	async set_admin(player: any) {
		this.chatGateway.sendModChannelMsg(`${player.name} has been PROMOTED TO ADMIN by ${this.user.username}`, this.channelId, player.name, 'ACTIVE');
		this.chatGateway.setAdmin(this.channelId, player.name);
		player.role = 'ADMIN';
	}

	async rm_admin(player: any) {
		this.chatGateway.sendModChannelMsg(`${player.name} has been DEMOTED TO MEMBER by ${this.user.username}`, this.channelId, player.name, 'ACTIVE');
		this.chatGateway.removeAdmin(this.channelId, player.name);
		player.role = 'MEMBER';
	}
	
}
