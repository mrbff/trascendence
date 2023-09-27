import { Component } from '@angular/core';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: string | null = null;

  constructor(private login: LoginService) {
    if (this.login.getUser() != null) this.user = this.login.getUser();
    else this.user = 'PROFILE';
  }
}
