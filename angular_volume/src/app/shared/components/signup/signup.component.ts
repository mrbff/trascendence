import { Component } from '@angular/core';
import { PasswordService } from 'src/app/shared/services/password.service';
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

  constructor(
    private passService: PasswordService,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
    this.errorMsg = '';
  }

  newUser() {
    const formValue = this.signupForm.value;
    let password = this.passService.password;
    let confirmPassword = this.passService.confirm;
    if (formValue.email.trim().length === 0) {
      this.errorMsg = 'Insert Email';
    } else if (formValue.username.trim().length === 0) {
      this.errorMsg = 'Insert Username';
    } else if (password.trim().length === 0) {
      this.errorMsg = 'Insert Password';
    } else if (confirmPassword.trim().length === 0) {
      this.errorMsg = 'Insert password again';
    } else if (password !== confirmPassword) {
      this.errorMsg = "Passwords doesn't match";
    } else {
      this.userService
        .registerUser({
          username: formValue.username,
          email: formValue.email,
          password: password,
        })
        .subscribe({
          next: (response) => {
            this.errorMsg = '';
            this.router.navigate(['login']);
            this.signupForm.reset();
            console.log('Utente registrato con successo', response);
          },
          error: (error) => {
            this.errorMsg = 'Error. Try again.';
            this.signupForm.reset();
            console.error('Errore durante la registrazione', error);
          },
        });
    }
    this.passService.reset();
  }
}
