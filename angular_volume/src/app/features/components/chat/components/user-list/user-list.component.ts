import { MessageComponent } from './../message/message.component';
import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Subscription, take } from 'rxjs';
import { Router } from '@angular/router';
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
	public isGroupChat: boolean = false;

	players: any[] = [];
attr: any;

	constructor(
		private readonly chatGateway: ChatGateway,
		private readonly router: Router,
		private readonly friendsService: FriendsService,
	  ) {
		this.otherUsers = [];
		this.players = [];
		this.isGroupChat = false;
	  }

	ngOnInit(): void {
		this.userList();
	}

	userList()
	{
		this.$subs.add(
			this.chatGateway.onChannelId().pipe().subscribe({
				next: (data: any) => {
					if (data.channel.type === 'DIRECT')
						this.isGroupChat = false;
					for (let user of data.channel.members) {						
						const username = user.user.username;
						const role = user.user.role;
						const id = user.user.id;
						const blockList = user.user.blockedBy;
						let isBlock = false;
						for (let blockUser of blockList) {
							if (blockUser.blocker.username === this.user.username) {
								isBlock = true;
							}
						}
						if (username !== this.user.username){
							console.log('isBlock:', isBlock);
							this.players.push({ id: id, name: username, showMenu: false, role: role, isBlock: isBlock });
						}
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
		console.log('profile:', player.name);
		this.router.navigate(['/trascendence/profile', player.name]);
	}
	  
	DM(player: any): void {
		console.log('DM:', player.name);
	}
		
	inviteToGame(player: any): void {
		console.log('inviteToGame:', player.name);
	}
		
	async block(player: any): Promise<void>{
		console.log('block:', player.name);
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
		console.log('mute:', player.name);
	}
		
	kick(player: any): void {
		console.log('kick:', player.name);
	}

	ban(player: any): void {
		console.log('ban:', player.name);
	}

	set_admin(player: any): void {
		console.log('set_admin:', player.name);
	}
}