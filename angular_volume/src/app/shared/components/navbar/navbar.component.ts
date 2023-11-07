import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  user!: string;
  screenW: any;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.user =
      this.userService.getUser() === ''
        ? 'PROFILE'
        : this.userService.getUser();
    this.screenW = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
  }
}
