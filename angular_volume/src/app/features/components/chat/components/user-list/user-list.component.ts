import { MessageComponent } from './../message/message.component';
import { AfterViewChecked, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Subscription, take } from 'rxjs';
import { UserInfo } from 'src/app/models/userInfo.model';

@Component({
	selector: 'app-user-list',
	templateUrl: './user-list.component.html',
	styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy{
	@Input() conversation!: any;
	@Input() user!: any;

	private $subs = new Subscription();
	public otherUsers!: UserInfo[];

	players: any[] = [];

	constructor(private readonly chatGateway: ChatGateway
	  ) {
		this.otherUsers = [];
		this.players = [];
	  }

	ngOnInit(): void {
		this.userList();
	}

	userList()
	{
		this.$subs.add(
			this.chatGateway.onChannelId().pipe().subscribe({
				next: (data: any) => {
					for (let user of data.channel.members) {
						const username = user.user.username;
						if (username !== this.user.username)
							this.players.push({ name: username, showMenu: false });
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
	}
	  
	DM(player: any): void {
		console.log('DM:', player.name);
	}
		
	inviteToGame(player: any): void {
		console.log('inviteToGame:', player.name);
	}
		
	block(player: any): void {
		console.log('block:', player.name);
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