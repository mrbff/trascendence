import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  errorMsg: string;
  loginForm: FormGroup;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService
  ) {
    this.errorMsg = '';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.auth.getToken() !== null) {
      this.router.navigate(['home']);
    }
  }

  async onLogin() {
    const formValue = this.loginForm.value;
    if (formValue.email.trim() === '') {
      this.errorMsg = 'Insert Email';
    } else if (this.loginForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (formValue.password.trim() === '') {
      this.errorMsg = 'Insert Password';
    } else {
      this.userService
        .login(formValue.email, formValue.password)
        .then((response) => {
          this.errorMsg = '';
          this.afterLogin(response);
        })
        .catch((error) => {
          console.log(error);
          this.errorMsg = 'Invalid credentials';
          this.loginForm.reset();
        });
    }
  }

  afterLogin(response: any) {
    this.auth.saveToken(response.token);
    this.userService.setUser(response.username);
    this.loginForm.reset();
    this.router.navigate(['home']);
  }
}
