import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Input } from '@angular/core';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent {
  password: string;
  confirmPass: string;
  showPassword: boolean;

  constructor(private data: DataService) {
    this.password = '';
    this.confirmPass = '';
    this.showPassword = false;
  }

  @Input()
  placeholder!: string;

  @Input()
  inputType!: string;

  @Input()
  id!: string;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  updatePass() {
    if (this.password.length != 0) this.data.password = this.password;
    if (this.confirmPass.length != 0) this.data.confirm = this.confirmPass;
    this.password = '';
    this.confirmPass = '';
  }

  onInputChange(newValue: string) {
    if (this.inputType === 'password') {
      this.password = newValue;
    } else if (this.inputType === 'confirm') {
      this.confirmPass = newValue;
    }
  }
}
