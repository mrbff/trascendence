import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  errorMsg: string;
  signupForm: FormGroup;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.errorMsg = '';

    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [null],
    });
  }

  onLogin() {
    const formValue = this.signupForm.value;
    if (this.signupForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (
      formValue.password === null ||
      formValue.password.trim().length === 0
    ) {
      this.errorMsg = 'Insert Password';
    } else {
      this.loginService
        .login({
          username: '',
          email: formValue.email,
          password: formValue.password,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.errorMsg = '';
            this.loginService.setUser(response.username);
            this.auth.login();
            this.signupForm.reset();
            this.router.navigate(['home']);
          },
          error: (error) => {
            console.log(error);
            this.errorMsg = 'Invalid credentials';
            this.signupForm.reset();
          },
        });
    }
  }
}
