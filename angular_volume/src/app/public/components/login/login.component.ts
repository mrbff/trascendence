import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent{
  email: string = '';
  password: string = '';
  errorMsg: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  onLogin() {
    if (this.email.trim().length === 0) {
      this.errorMsg = "Insert Username";
    } else if (this.password.trim().length === 0) {
      this.errorMsg = "Insert Password";
    } else {
      this.errorMsg = "";
      let resp = this.loginService.login(this.email, this.password);
      if (resp === 200) {
        this.errorMsg = "";
        this.router.navigate(['home']);
      } else if (resp === 403) {
        this.errorMsg = "Invalid credentials";
      }
    }
  }
}