import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';
import { FriendsService } from '../../../core/services/friends.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { UserLoggedModel } from 'src/app/models/userLogged.model';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user!: UserLoggedModel;
  currentUser: boolean;
  isFriend: boolean;
  newQr: boolean;
  showQr: boolean;
  isBlocked: boolean;

  // FOR IMAGE CHANGE
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly status: StatusService,
    private readonly googleAuth: GoogleAuthService,
    private readonly route: ActivatedRoute,
    private readonly friendsService: FriendsService,
    private readonly imageCompress: NgxImageCompressService
  ) {
    this.currentUser = true;
    this.isFriend = false;
    this.newQr = false;
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
        this.blockedUserFakeInfo(username);
      }
    }
  }

  // PLACEHOLDER INFOS
  blockedUserFakeInfo(username: string) {
    const partialUser: Partial<UserLoggedModel> = {
      username: username,
      Wins: '0',
      Losses: '0',
      img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
      isOnline: false,
      isPlaying: false,
    };
    this.user = { ...this.user, ...partialUser };
  }

  logout() {
    this.status.setStatus(this.user.id, false);
    this.userService.deleteAllInfo();
    this.router.navigate(['/login']);
  }

  // SELECT NEW FILE, COMPRESS IMAGE BASE64 AND PATCH USER IMG
  onFileSelected(event: Event) {
    this.fileInput.nativeElement.click();
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let profileImage = e.target?.result as string;
        await this.imageCompress
          .compressFile(profileImage, -1, 50, 50)
          .then(async (result) => {
            this.user.img = result;
            await this.userService.setUserAvatar(this.user.id, this.user.img);
          })
          .catch(() => alert('IMAGE LOADING FAILED. TRY AGAIN'));
      };
      reader.readAsDataURL(file);
    }
  }

  // CHECK IF USER 2FA ENABLE AND OPEN NEW QR CODE OR LATEST
  async onEnable2FA() {
    this.showQr = true;
    if (this.user.is2faEnabled === false) {
      await this.googleAuth.getLink(this.user.id).then((response) => {
        this.user.qrcode2fa = response.url.qrUrl;
        this.newQr = true;
      });
    } else {
      this.newQr = false;
    }
  }

  async onConfirm2FA() {
    this.user.is2faEnabled = true;
    await this.status.set2fa(this.user.id, true).then(() => {
      this.showQr = false;
    });
  }

  async onReject2FA() {
    this.user.is2faEnabled = false;
    await this.status.set2fa(this.user.id, false).then(() => {
      this.showQr = false;
    });
  }

  closeQr() {
    this.showQr = false;
  }

  async addFriend() {
    await this.friendsService
      .addFriend(this.user.username)
      .then(() => (this.isFriend = true));
  }

  async removeFriend() {
    await this.friendsService
      .deleteFriend(this.user.username)
      .then(() => (this.isFriend = false));
  }

  async blockUser() {
    await this.friendsService
      .blockUser(this.user.username)
      .then(() => (this.isBlocked = true));
  }

  async unblockUser() {
    await this.friendsService
      .unblockUser(this.user.username)
      .then(() => (this.isBlocked = false));
  }
}
