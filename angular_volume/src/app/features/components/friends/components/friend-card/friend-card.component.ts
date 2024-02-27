import { UserService } from 'src/app/core/services/user.service';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/models/userInfo.model';
import { InvitesService } from 'src/app/core/services/game-invite.service';


@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent implements OnInit, AfterViewInit {
  @Input() username: string;
  @Input() topVh: boolean;
  @Input() pending: any;

  user!: UserInfo;
  win!: string;
  status!: any;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router,
    private readonly invites: InvitesService,
    private readonly chatGateway: ChatGateway,
    private readonly userService: UserService,
  ) {
    this.username = '';
    this.topVh = true;
  }

  async ngOnInit() {
    await this.friendsService
      .getFriendInfo(this.username)
      .then((user) => {
        this.user = user;
      })
      .catch((err) => console.error(err));
  }

  ngAfterViewInit() {
    this.status = document.querySelector('.profile-img');
    let height: any = document.querySelector('.card-box');
    if (this.topVh === true) {
      height.style.top = '14vh';
    } else {
      height.style.top = '20vh';
    }
  }

  async inviteToGame(){
    //console.log("Inviting to game");
    const user = this.userService.getUser();
    //this.invites.invite(this.username);
    //console.log(this.pending);
    if (this.pending.find((x: any) => x.username === this.username) === undefined) {
    const ch = await this.chatGateway.getChatOrCreate(user, this.username, "DIRECT");
    this.chatGateway.sendInviteMsg(ch.id, this.username, "normal");
    }
  }

  openFriendProfile() {
    this.router.navigate(['/transcendence/profile', this.username]);
  }

  openFriendChat() {
    //converto to id
    this.router.navigate(['/transcendence/chat/'], {
      queryParams: { username: this.username },
    });
  }
}
