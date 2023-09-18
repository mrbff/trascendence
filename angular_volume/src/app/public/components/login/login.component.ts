import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string;
  password: string;
  errorMsg: string;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private data: DataService
  ) {
    this.email = '';
    this.password = '';
    this.errorMsg = '';
  }

  onLogin() {
    this.password = this.data.password;
    if (this.email.trim().length === 0) {
      this.errorMsg = 'Insert Username';
    } else if (this.password.trim().length === 0) {
      this.errorMsg = 'Insert Password';
    } else {
      this.errorMsg = '';
      this.loginService
        .login({ username: '', email: this.email, password: this.password })
        .subscribe({
          next: (response) => {
            this.router.navigate(['home']);
            resetInput();
          },
          error: (error) => {
            this.errorMsg = 'Invalid credentials';
            resetInput();
          },
        });
    }
    const resetInput = () => {
      this.email = '';
      this.password = '';
      this.data.reset;
    };
  }
}
