import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { FriendsService } from 'src/app/core/services/friends.service';
import { BLOCKED_USER_INFO, UserInfo } from 'src/app/models/userInfo.model';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user!: UserInfo;
  currentUser: boolean;
  isFriend: boolean;
  showQr: boolean;
  isBlocked: boolean;
  private $userSubs: Subscription;
  games: any;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly status: StatusService,
    private readonly route: ActivatedRoute,
    private readonly friendsService: FriendsService,
    private readonly cookies: CookieService,
  ) {
    this.currentUser = true;
    this.isFriend = false;
    this.showQr = false;
    this.isBlocked = false;
    this.$userSubs = new Subscription();
    this.games = [ ];
  }

  ngOnInit(): void {
    // SEARCH USER FROM PARAM IN URL
    window.onbeforeunload = () => this.ngOnDestroy();
    this.userService.patchNumberOfConnections('+');
    this.$userSubs.add(
      this.route.params.subscribe((params) => {
        const username = params['username'];
        if (username !== undefined) {
          this.profileInit(username);
        } else {
          this.router.navigate(['/transcendence/home']);
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.cookies.get('user'))
      this.userService.patchNumberOfConnections('-').catch((err) => console.error('Error auth expired'));
    if (this.$userSubs) {
      this.$userSubs.unsubscribe();
    }
  }

  // SUBSCRIBE TO USER OBSERVABLE
  private profileInit(username: string) {
    if (username === this.userService.getUser()) {
      this.currentUser = true;
      this.$userSubs.add(
        this.userService.getUserObservable().subscribe((user) => {
          //console.log(user)
          this.user = user;
        })
      );
      this.userService.updateUser();
    } else {
      this.currentUser = false;
      this.otherUserInit(username);
    }
  }

  private async otherUserInit(username: string) {
    // CHECK IF USER BLOCKED
    this.isBlocked = await this.friendsService.isBlocked(username);
    if (!this.isBlocked) {
      this.user = await this.friendsService.getFriendInfo(username);
      this.isFriend = await this.friendsService.isFriend(username);
    } else {
      // PLACEHOLDERS USER INFO
      this.user = {
        username: username,
        ...BLOCKED_USER_INFO,
      } as UserInfo;
    }
  }


  async logout() {
    await this.status.setStatus(this.user.id, false);
    this.userService.patchNumberOfConnections('-');
    this.userService.deleteAllCookie();
    this.router.navigate(['/login']);
  }
}
