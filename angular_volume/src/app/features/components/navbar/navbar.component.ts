import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
}
