import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private password: string = '';
  private confirmPass: string = '';

  getPassword(): string {
    return this.password;
  }

  getConfirm(): string {
    return this.confirmPass;
  }

  setPassword(password: string) {
    this.password = password;
  }

  setConfirm(confirmPass: string) {
    this.confirmPass = confirmPass;
  }
}
