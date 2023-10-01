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
      password: [null],
    });
  }

  ngOnInit(): void {
    if (this.auth.getToken() !== null) this.router.navigate(['home']);
  }

  onLogin() {
    const formValue = this.loginForm.value;
    if (this.loginForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (
      formValue.password === null ||
      formValue.password.trim().length === 0
    ) {
      this.errorMsg = 'Insert Password';
    } else {
      this.userService
        .login({
          username: '',
          email: formValue.email,
          password: formValue.password,
        })
        .subscribe({
          next: (response) => {
            this.errorMsg = '';
            console.log(response);
            this.userService.setUser(response.username);
            this.auth.saveToken(response.token);
            this.loginForm.reset();
            this.router.navigate(['home']);
          },
          error: (error) => {
            console.log(error);
            this.errorMsg = 'Invalid credentials';
            this.loginForm.reset();
          },
        });
    }
  }
}
