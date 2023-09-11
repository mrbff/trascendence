import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent{
  email: string = '';
  errorMsg: string = '';

  constructor(private loginService: LoginService, private router: Router, private data: DataService) {}

  onLogin() {
    let password: string = this.data.getPassword();

    if (this.email.trim().length === 0) {
      this.errorMsg = "Insert Username";
    } else if (password.trim().length === 0) {
      this.errorMsg = "Insert Password";
    } else {
      this.errorMsg = "";
      let resp = this.loginService.login(this.email, password);
      if (resp === 200) {
        this.errorMsg = "";
        this.router.navigate(['home']);
      } else if (resp === 403) {
        this.errorMsg = "Invalid credentials";
      }
    }
  }
}