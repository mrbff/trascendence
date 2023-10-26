import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';
import { FriendsService } from '../../../core/services/friends.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  user!: string;
  profileImage!: string;
  win!: number;
  lose!: number;
  qrCode: string;
  userQr: string;
  private id!: string;
  twofa: boolean;
  private is2faEnabled: boolean;
  private icon2fa!: any;
  currentUser: boolean;
  isOnline!: boolean;
  isPlaying!: boolean;
  isFriend: boolean;
  changeColor: any;

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
    this.qrCode = '';
    this.id = this.userService.getUserId();
    this.twofa = false;
    this.currentUser = true;
    this.is2faEnabled = false;
    this.userQr = '';
    this.isFriend = false;
    this.changeColor = new EventEmitter<string>();
  }

  async ngOnInit() {
    // SEARCH USER FROM PARAM IN URL
    this.route.params.subscribe(async (params) => {
      const username = params['username'];
      await this.profileInit(username);
    });
  }

  async ngAfterViewInit() {
    this.icon2fa = document.querySelector('.google-auth');
    await this.changeColor.subscribe((resp: string) => {
      let profileColor: any = document.querySelector('.profile-image');
      profileColor.style.color = resp;
    });
  }

  // LOAD USER INFO FOR PROFILE PAGE
  private async profileInit(username: string) {
    if (username === this.userService.getUser()) {
      this.currentUser = true;
      await this.userService
        .getUserInfo()
        .then((response) => this.initProfile(response));
    } else {
      this.currentUser = false;
      await this.friendsService
        .getFriendInfo(username)
        .then(async (response) => {
          this.initProfile(response);
        });
      await this.friendsService
        .getFriends()
        .then((resp) => {
          for (let i = 0; i < resp.length; i++) {
            if (resp[i].username === this.user) {
              this.isFriend = true;
              break;
            }
          }
        })
        .catch((err) => console.error(err));
    }
  }

  private async initProfile(response: any) {
    this.user = response.username ? response.username : 'USER';
    this.profileImage = response.img
      ? response.img
      : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.win = response.Wins;
    this.lose = response.Losses;
    if (response.is2faEnabled) {
      this.userQr = response.qrcode2fa;
      this.is2faEnabled = true;
      this.icon2fa.style.color = 'green';
    }
    this.isPlaying = response.isPlaying;
    this.isOnline = response.isOnline;
    if (this.isPlaying === true) {
      this.changeColor.emit('orange');
    } else if (this.isOnline === true) {
      this.changeColor.emit('green');
    } else {
      this.changeColor.emit('red');
    }
  }

  logout() {
    this.status.setStatus(this.id, false);
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
        this.profileImage = e.target?.result as string;
        await this.imageCompress
          .compressFile(this.profileImage, -1, 50, 50)
          .then(async (result) => {
            this.profileImage = result;
            await this.userService.setUserAvatar(this.id, this.profileImage);
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
        .getLink(this.id)
        .then((response) => {
          this.qrCode = response.url.qrUrl;
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      this.qrCode = this.userQr;
      this.twofa = true;
    }
  }

  async onConfirm2FA() {
    this.qrCode = '';
    this.icon2fa.style.color = 'green';
    await this.status.set2fa(this.id, true);
  }

  async onReject2FA() {
    this.qrCode = '';
    this.icon2fa.style.color = 'red';
    await this.status.set2fa(this.id, false);
  }

  closeQr() {
    this.qrCode = '';
  }

  async addFriend() {
    this.isFriend = true;
    await this.friendsService.addFriend(this.user);
  }

  async removeFriend() {
    this.isFriend = false;
    await this.friendsService.deleteFriend(this.user);
  }

  async blockUser() {
    await this.friendsService.blockUser(this.user);
  }
}
