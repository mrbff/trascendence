import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  private is2faEnabled: boolean;
  currentUser: boolean;
  isFriend: boolean;
  twofa: boolean;
  qrCode: string;

  // FOR IMAGE CHANGE
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly status: StatusService,
    private readonly googleAuth: GoogleAuthService,
    private readonly route: ActivatedRoute,
    private readonly friendsService: FriendsService,
    private imageCompress: NgxImageCompressService
  ) {
    this.currentUser = true;
    this.is2faEnabled = false;
    this.isFriend = false;
    this.twofa = false;
    this.qrCode = '';
  }

  ngOnInit() {
    // SEARCH USER FROM PARAM IN URL
    this.route.params.subscribe(async (params) => {
      const username = params['username'];
      this.profileInit(username);
    });
  }

  // GET USER INFO FOR PROFILE PAGE
  private async profileInit(username: string) {
    if (username === this.userService.getUser()) {
      this.currentUser = true;
      this.user = await this.userService.getUserInfo();
    } else {
      this.currentUser = false;
      this.user = await this.friendsService.getFriendInfo(username);
      /* await this.friendsService
        .getFriends()
        .then((resp) => {
          for (let i = 0; i < resp.length; i++) {
            if (resp[i].username === this.user) {
              this.isFriend = true;
              break;
            }
          }
        })
        .catch((err) => console.error(err)); */
    }
  }

  logout() {
    this.status.setStatus(this.user.id, false);
    this.auth.removeToken();
    this.userService.removeUser();
    this.userService.removeUserId();
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
          .catch((err) => console.error(err));
      };
      reader.readAsDataURL(file);
    }
  }

  async onEnable2FA() {
    // CHECK IF USER 2FA ENABLE AND OPEN NEW QR CODE OR LATEST
    if (this.is2faEnabled === false) {
      this.twofa = false;
      this.googleAuth
        .getLink(this.user.id)
        .then((response) => {
          this.qrCode = response.url.qrUrl;
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      this.qrCode = this.user.qrcode2fa;
      this.twofa = true;
    }
  }

  async onConfirm2FA() {
    this.qrCode = '';
    let icon2fa: any = document.querySelector('.google-auth');
    icon2fa.style.color = 'green';
    await this.status.set2fa(this.user.id, true);
  }

  async onReject2FA() {
    this.qrCode = '';
    let icon2fa: any = document.querySelector('.google-auth');
    icon2fa.style.color = 'red';
    await this.status.set2fa(this.user.id, false);
  }

  closeQr() {
    this.qrCode = '';
  }

  async addFriend() {
    this.isFriend = true;
    await this.friendsService.addFriend(this.user.username);
  }

  async removeFriend() {
    this.isFriend = false;
    await this.friendsService.deleteFriend(this.user.username);
  }

  async blockUser() {
    await this.friendsService.blockUser(this.user.username);
  }
}
