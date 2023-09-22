import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';
import { UserData } from 'src/app/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  errorMsg: string;

  constructor(
    private data: DataService,
    private userService: UserService,
    private router: Router
  ) {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.username = '';
    this.errorMsg = '';
  }

  newUser() {
    this.password = this.data.password;
    this.confirmPassword = this.data.confirm;
    if (this.email.trim().length === 0) {
      this.errorMsg = 'Insert Email';
    } else if (this.username.trim().length === 0) {
      this.errorMsg = 'Insert Username';
    } else if (this.password.trim().length === 0) {
      this.errorMsg = 'Insert Password';
    } else if (this.confirmPassword.trim().length === 0) {
      this.errorMsg = 'Insert password again';
    } else if (this.password !== this.confirmPassword) {
      this.errorMsg = "Passwords doesn't match";
    } else {
      this.userService
        .registerUser({
          username: this.username,
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (response) => {
            this.errorMsg = '';
            this.router.navigate(['login']);
            resetInput();
            console.log('Utente registrato con successo', response);
          },
          error: (error) => {
            this.errorMsg = 'Error. Try again.';
            resetInput();
            console.error('Errore durante la registrazione', error);
          },
        });
    }
    const resetInput = () => {
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.username = '';
      this.data.reset;
    };
  }
}
