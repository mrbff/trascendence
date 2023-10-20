import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { GoogleAuthService } from 'src/app/core/auth/google-auth.service';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  user!: string;
  userInfo!: any;
  profileImage!: string;
  win!: number;
  lose!: number;
  qrCode: string;
  private id!: string;
  twofa: boolean;
  icon!: any;

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

  async ngOnInit() {
    this.userInfo = await this.userService.getUserInfo(this.id);
    this.user = this.userInfo.username ? this.userService.getUser() : 'USER';
    this.profileImage = this.userInfo.img
      ? this.userInfo.img
      : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.win = this.userInfo.Wins;
    this.lose = this.userInfo.Losses;
    if (this.userInfo.is2faEnabled) {
      this.icon.style.color = 'green';
    }
  }

  ngAfterViewInit(): void {
    this.icon = document.querySelector('.google-auth');
  }

  logout() {
    this.status.setStatus(this.id, false);
    this.auth.removeToken();
    this.userService.removeUser();
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

  async onEnable2FA() {
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
    this.icon.style.color = 'green';
  }

  async onReject2FA() {
    this.qrCode = '';
    await this.status.set2fa(this.id, false);
    this.icon.style.color = 'red';
  }

  closeQr() {
    this.qrCode = '';
  }
}
