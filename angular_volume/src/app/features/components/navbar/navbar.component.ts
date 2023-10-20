import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user!: string;
  icon!: any;
  background!: any;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.user =
      this.userService.getUser() === ''
        ? 'PROFILE'
        : this.userService.getUser();
  }

  onMenuClick() {
    this.icon = document.querySelector('.responsive');
    this.background = document.querySelector('.backresp');
    if (this.icon.style.display === 'none') {
      this.icon.style.display = 'block';
      this.background.style.display = 'block';
    } else {
      this.icon.style.display = 'none';
      this.background.style.display = 'none';
    }
  }
}
