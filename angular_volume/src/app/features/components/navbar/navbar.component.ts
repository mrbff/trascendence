import { Component } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: string | null = null;

  constructor(private userService: UserService) {
    if (this.userService.getUser() != null)
      this.user = this.userService.getUser();
    else this.user = 'PROFILE';
  }
}
