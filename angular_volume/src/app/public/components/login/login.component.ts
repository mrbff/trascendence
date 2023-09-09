import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  constructor(private loginService: LoginService) {}

  onLogin() {
    this.loginService.login(this.email, this.password).subscribe((response) => {
      // Handle JWT token, save it, etc.
    });
  }
}
