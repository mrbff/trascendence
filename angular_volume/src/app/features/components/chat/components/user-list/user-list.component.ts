import { channel } from 'diagnostics_channel';
import { UseGuards, ConsoleLogger } from '@nestjs/common';
import { MessageComponent } from './../message/message.component';
import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Subscription, skip, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendsService } from 'src/app/core/services/friends.service';
import { UserInfo } from 'src/app/models/userInfo.model';
import * as path from 'path';


@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy{
	@Input() user!: any;

	private $subs = new Subscription();
	public otherUsers!: UserInfo[];
	public isGroupChat: boolean = true;
	public myRole : string = 'MEMBER';
	public channelId: string = '';
	public channelName: string = '';

	players: any[] = [];
	attr: any;

	constructor(
		private readonly chatGateway: ChatGateway,
		private readonly router: Router,
		private readonly friendsService: FriendsService,
		private activatedRoute: ActivatedRoute,
	  ) {
			this.players.push({ 
				id: '',
				name: 'No users in this channel',
				showMenu: false,
				role: 'EMPTY',
				isBlock: false,
				banOrKick: ''
			});
	  }

	ngOnInit(): void {
		this.userList();
	}

	userList()
	{
		this.$subs.add(
			this.chatGateway.onChannelId().subscribe({
				next: (data: any) => {
					//console.log('onChannelId Data:', data);
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
						for (let blockUser of blockList) {
							if (blockUser.blocker.username === this.user.username) {
								isBlock = true;
							}
						}
						if (username !== this.user.username && banOrKick !== 'KICKED'){
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
								});
						}
						else if (username === this.user.username) {
							this.myRole = role;
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

	togglePlayerMenu(player: any): void {
		this.players.forEach((p) => (p.showMenu = false));
		player.showMenu = !player.showMenu;
	}

	profile(player: any): void {
		//console.log('profile:', player.name);
		this.router.navigate(['/transcendence/profile', player.name]);
	}

	async DM(player: any): Promise<void> {
		if (this.isGroupChat) {
			//console.log('DM:', player.name);
			let channel = await this.chatGateway.getDirectChatByNames(this.user.username, player.name);
			if (channel === null) {
				this.chatGateway.sendPrivMsg("", player.name);
				channel = await this.chatGateway.getDirectChatByNames(this.user.username, player.name);
			}
			this.chatGateway.getChannelById(channel.id);
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
		console.log('inviteToGame:', player.name);
	}

	async block(player: any): Promise<void>{
		//console.log('block:', player.name);
		await this.friendsService
		.blockUser(player.name)
		.then(() => (player.isBlock = true));
	}

	async unblock(player: any): Promise<void> {
		await this.friendsService
		.unblockUser(player.name)
		.then(() => (player.isBlock = false));
	}

	mute(player: any): void {
		//console.log('mute:', player.name);
	}

	async kick(player: any): Promise<void> {
		this.chatGateway.changeUserStatus(this.channelId, player.name, 'KICKED');
		//this.chatGateway.leaveChannel(this.channelId, player.name);
		//console.log('kick:', player.name);
		this.chatGateway.sendModChannelMsg(`${player.name} has been KICKED from the channel by ${this.user.username}`, this.channelId);
	}

	ban(player: any): void {
		this.chatGateway.changeUserStatus(this.channelId, player.name, 'BANNED');
		//console.log('ban:', player.name);
		this.chatGateway.sendModChannelMsg(`${player.name} has been BANNED from the channel by ${this.user.username}`, this.channelId);
	}

	unban(player: any): void {
		this.chatGateway.changeUserStatus(this.channelId, player.name, 'KICKED');
		//console.log('unban:', player.name);
	}

	async set_admin(player: any) {
		//console.log('set_admin:', player.name);
		this.chatGateway.setAdmin(this.channelId, player.name);
		player.role = 'ADMIN';
		this.chatGateway.sendModChannelMsg(`${player.name} has been PROMOTED TO ADMIN by ${this.user.username}`, this.channelId);
	}

	async rm_admin(player: any) {
		//console.log('rm_admin:', player.name);
		this.chatGateway.removeAdmin(this.channelId, player.name);
		player.role = 'MEMBER';
		this.chatGateway.sendModChannelMsg(`${player.name} has been DEMOTED TO MEMBER by ${this.user.username}`, this.channelId);
	}
	
}