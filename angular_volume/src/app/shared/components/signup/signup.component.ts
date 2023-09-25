import { Component } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      username: [null],
      password: [null],
      confirmPassword: [null],
    });
    this.errorMsg = '';
    this.showPassword = false;
    this.showConfirm = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmVisibility() {
    this.showConfirm = !this.showConfirm;
  }

  newUser() {
    const formValue = this.signupForm.value;
    if (formValue.email.trim().length === 0) {
      this.errorMsg = 'Insert Email';
    } else if (this.signupForm.get('email')?.hasError('email')) {
      this.errorMsg = 'Insert Valid Email';
    } else if (
      formValue.username === null ||
      formValue.username.trim().length === 0
    ) {
      this.errorMsg = 'Insert Username';
    } else if (
      formValue.password === null ||
      formValue.password.trim().length === 0
    ) {
      this.errorMsg = 'Insert Password';
    } else if (
      formValue.confirmPassword === null ||
      formValue.confirmPassword.trim().length === 0
    ) {
      this.errorMsg = 'Insert password again';
    } else if (formValue.password !== formValue.confirmPassword) {
      this.errorMsg = "Passwords doesn't match";
    } else {
      this.userService
        .registerUser({
          username: formValue.username,
          email: formValue.email,
          password: formValue.password,
        })
        .subscribe({
          next: (response) => {
            this.errorMsg = '';
            this.signupForm.reset();
            this.router.navigate(['login']);
            console.log('Utente registrato con successo', response);
          },
          error: (error) => {
            this.signupForm.reset();
            this.errorMsg = 'Error. Try again.';
            console.error('Errore durante la registrazione', error);
          },
        });
    }
  }
}
