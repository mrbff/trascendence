import { Component } from '@angular/core';
import { DataService } from 'src/app/public/services/data.service';
import { UserData } from 'src/app/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword = '';
  errorMsg: string = '';
  username: string = '';

  constructor(private data:DataService, private userService: UserService) {}

  newUser() {
    this.password = this.data.getPassword();
    this.confirmPassword = this.data.getConfirm();
    if (this.email.trim().length === 0) {
      this.errorMsg = "Insert Email";
    } else if(this.username.trim().length === 0){
      this.errorMsg = "Insert Username";
    } else if (this.password.trim().length === 0) {
      this.errorMsg = "Insert Password";
    } else if (this.confirmPassword.trim().length === 0) {
      this.errorMsg = "Insert password again";
    } else if (this.password !== this.confirmPassword) {
        this.errorMsg = "Passwords doesn't match";
    } else {
      this.errorMsg = "";

    }
    this.userService.registerUser({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Utente registrato con successo', response);
      },
      error: (error) => {
        console.error('Errore durante la registrazione', error);
      }
    });
  }
}
