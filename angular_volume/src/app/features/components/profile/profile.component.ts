import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user!: string;
  profileImage!: string;
  win!: number;
  lose!: number;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

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
    this.auth.removeToken();
    this.userService.removeUser();
    this.userService.removeUserAvatar();
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
}
