import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { FriendsService } from '../../../core/services/friends.service';
import {
  BLOCKED_USER_INFO,
  UserLoggedModel,
} from 'src/app/models/userLogged.model';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user!: UserLoggedModel;
  currentUser: boolean;
  isFriend: boolean;
  showQr: boolean;
  isBlocked: boolean;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly status: StatusService,
    private readonly route: ActivatedRoute,
    private readonly friendsService: FriendsService
  ) {
    this.currentUser = true;
    this.isFriend = false;
    this.showQr = false;
    this.isBlocked = false;
  }

  ngOnInit() {
    // SEARCH USER FROM PARAM IN URL
    this.route.params.subscribe(async (params) => {
      const username = params['username'];
      this.profileInit(username);
    });
  }

  // GET USER OR FRIEND INFO FOR PROFILE PAGE
  private async profileInit(username: string) {
    if (username === this.userService.getUser()) {
      this.currentUser = true;
      this.user = await this.userService.getUserInfo();
    } else {
      this.currentUser = false;
      // CHECK IF USER BLOCKED
      this.isBlocked = await this.friendsService.isBlocked(username);
      if (!this.isBlocked) {
        this.user = await this.friendsService.getFriendInfo(username);
        this.isFriend = await this.friendsService.isFriend(username);
      } else {
        this.user = {
          username: username,
          ...BLOCKED_USER_INFO,
        } as UserLoggedModel;
      }
    }
  }

  logout() {
    this.status.setStatus(this.user.id, false);
    this.userService.deleteAllInfo();
    this.router.navigate(['/login']);
  }
}
