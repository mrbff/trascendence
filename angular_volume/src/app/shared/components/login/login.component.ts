import { Component } from '@angular/core';
import { LoginService } from '../../../core/services/login.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  errorMsg: string;
  showPassword: boolean;
  signupForm: FormGroup;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.errorMsg = '';
    this.showPassword = false;
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [null],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
