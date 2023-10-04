import { Component } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMsg: string;
  showPassword: boolean;
  showConfirm: boolean;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private auth: AuthService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.errorMsg = '';
    this.showPassword = false;
    this.showConfirm = false;
  }

  ngOnInit(): void {
    if (this.auth.getToken() !== '') {
      this.router.navigate(['home']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmVisibility() {
    this.showConfirm = !this.showConfirm;
  }

  newUser() {
    const formValue = this.signupForm.value;
    const validations = [
      {
        condition: formValue.username.trim() === '',
        message: 'Insert Username',
      },
      { condition: formValue.email.trim() === '', message: 'Insert Email' },
      {
        condition: this.signupForm.get('email')?.hasError('email'),
        message: 'Insert Valid Email',
      },
      {
        condition: formValue.password.trim() === '',
        message: 'Insert Password',
      },
      {
        condition: this.signupForm.get('password')?.hasError('minlength'),
        message: 'Password too short(Min length: 6)',
      },
      {
        condition: formValue.confirmPassword === '',
        message: 'Insert password again',
      },
      {
        condition: formValue.password !== formValue.confirmPassword,
        message: "Passwords don't match",
      },
    ];
    for (const validation of validations) {
      if (validation.condition) {
        this.errorMsg = validation.message;
        return;
      }
    }
    this.errorMsg = '';
    this.onSignup(formValue);
  }

  async onSignup(formValue: any) {
    this.userService
      .registerUser({
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
      })
      .then((response) => {
        this.signupForm.reset();
        this.router.navigate(['login']);
      })
      .catch((error) => {
        this.errorMsg = 'Error. Try again.';
        this.signupForm.reset();
      });
  }
}
