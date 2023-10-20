import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user!: string;
  profileImage!: string;
  win!: number;
  lose!: number;
  qrCode: string;
  private id: string;
  twofa: boolean;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly status: StatusService,
    private readonly googleAuth: GoogleAuthService
  ) {
    this.qrCode = '';
    this.id = this.userService.getUserId();
    this.twofa = false;
  }

  ngOnInit(): void {
    this.user = this.userService.getUser()
      ? this.userService.getUser()
      : 'USER';
    this.profileImage = this.userService.getUserAvatar()
      ? this.userService.getUserAvatar()
      : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.win = 0;
    this.lose = 0;
  }

  logout() {
    this.status.setStatus(this.id, false);
    this.auth.removeToken();
    this.userService.removeUser();
    this.userService.removeUserAvatar();
    this.userService.removeUserId();
    this.router.navigate(['login']);
  }

  onFileSelected(event: Event) {
    // WIP: LOGICA MOMENTANEA => DA INVIARE A BACKEND
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addFriend() {
    let icon: any = document.querySelector('.friend');
    icon.style.color = 'grey';
  }

  async onEnable2FA() {
    const userInfo = await this.userService.getUserInfo(this.id);
    console.log(userInfo);
    if (userInfo.is2faEnabled === false) {
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
      this.qrCode = userInfo.qrcode2fa;
    }
  }

  async onConfirm2FA() {
    this.qrCode = '';
    await this.status.set2fa(this.id, true);
  }

  async onReject2FA() {
    this.qrCode = '';
    await this.status.set2fa(this.id, false);
  }

  closeQr() {
    this.qrCode = '';
  }
}
