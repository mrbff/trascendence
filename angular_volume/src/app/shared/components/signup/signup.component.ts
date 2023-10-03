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
      username: [''],
      password: [''],
      confirmPassword: [''],
    });
    this.errorMsg = '';
    this.showPassword = false;
    this.showConfirm = false;
  }

  ngOnInit(): void {
    if (this.auth.getToken() !== null) this.router.navigate(['home']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmVisibility() {
    this.showConfirm = !this.showConfirm;
  }

  newUser() {
    const formValue = this.signupForm.value;
    if (formValue.username.trim() === '') {
      this.errorMsg = 'Insert Username';
    } else if (formValue.email.trim() === '') {
      this.errorMsg = 'Insert Email';
    } else if (this.signupForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (formValue.password.trim() === '') {
      this.errorMsg = 'Insert Password';
    } else if (formValue.confirmPassword === '') {
      this.errorMsg = 'Insert password again';
    } else if (formValue.password !== formValue.confirmPassword) {
      this.errorMsg = "Passwords doesn't match";
    } else {
      this.errorMsg = '';
      this.onSignup(formValue);
    }
  }

  async onSignup(formValue: any) {
    try {
      const response = await this.userService.registerUser({
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
      });
      this.signupForm.reset();
      this.router.navigate(['login']);
    } catch (error) {
      this.errorMsg = 'Error. Try again.';
      this.signupForm.reset();
    }
  }
}
