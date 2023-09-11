import { Component } from '@angular/core';
import { DataService } from 'src/app/public/services/data.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  errorMsg: string = '';

  constructor(private data:DataService) {}

  newUser() {
    let password:string = this.data.getPassword();
    let confirmPassword:string = this.data.getConfirm();
    if (this.email.trim().length === 0) {
      this.errorMsg = "Insert Email";
    } else if (password.trim().length === 0) {
      this.errorMsg = "Insert Password";
    } else if (confirmPassword.trim().length === 0) {
      this.errorMsg = "Insert password again";
    } else if (password !== confirmPassword) {
        this.errorMsg = "Passwords doesn't match";
    } else {
      this.errorMsg = "";
    }
  }
}
