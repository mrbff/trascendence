import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';
import { FriendsService } from '../../../core/services/friends.service';
import { Subscription } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  user!: string;
  private userInfo!: any;
  profileImage!: string;
  win!: number;
  lose!: number;
  qrCode: string;
  private id!: string;
  twofa: boolean;
  private icon2fa!: any;
  currentUser: boolean;
  isOnline!: boolean;
  isPlaying!: boolean;

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
  }

  ngOnInit() {
    // SEARCH USER FROM PARAM IN URL
    this.route.params.subscribe(async (params) => {
      const username = params['username'];
      await this.profileInit(username);
    });
  }

  ngAfterViewInit() {
    this.icon2fa = document.querySelector('.google-auth');
  }

  // LOAD USER INFO FOR PROFILE PAGE
  private async profileInit(username: string) {
    if (username === this.userService.getUser()) {
      this.userInfo = await this.userService.getUserInfo();
      this.currentUser = true;
    } else {
      this.userInfo = await this.friendsService.getFriendInfo(username);
      this.currentUser = false;
    }
    this.user = this.userInfo.username ? this.userInfo.username : 'USER';
    this.profileImage = this.userInfo.img
      ? this.userInfo.img
      : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.win = this.userInfo.Wins;
    this.lose = this.userInfo.Losses;
    if (this.userInfo.is2faEnabled) {
      this.icon2fa.style.color = 'green';
    }
    this.isPlaying = this.userInfo.isPlaying;
    this.isOnline = this.userInfo.isOnline;
    console.log(this.userInfo);
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
    if (this.userInfo.is2faEnabled === false) {
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
      this.twofa = true;
      this.qrCode = this.userInfo.qrcode2fa;
    }
  }

  async onConfirm2FA() {
    this.qrCode = '';
    await this.status.set2fa(this.id, true);
    this.icon2fa.style.color = 'green';
  }

  async onReject2FA() {
    this.qrCode = '';
    await this.status.set2fa(this.id, false);
    this.icon2fa.style.color = 'red';
  }

  closeQr() {
    this.qrCode = '';
  }
}
