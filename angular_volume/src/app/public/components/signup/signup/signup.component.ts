import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMsg: string = '';

  newUser() {
    if (this.email.trim().length === 0) {
      this.errorMsg = "Insert Email";
    } else if (this.password.trim().length === 0) {
      this.errorMsg = "Insert Password";
    } else if (this.confirmPassword.trim().length === 0) {
      this.errorMsg = "Insert password again";
    } else if (this.password !== this.confirmPassword) {
        this.errorMsg = "Passwords doesn't match";
    } else {
      this.errorMsg = "";
    }
  }
}
