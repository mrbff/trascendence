import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PasswordService {
  private _password: string;
  private _confirmPass: string;

  constructor() {
    this._password = '';
    this._confirmPass = '';
  }

  get password(): string {
    return this._password;
  }

  get confirm(): string {
    return this._confirmPass;
  }

  set password(password: string) {
    this._password = password;
  }

  set confirm(confirmPass: string) {
    this._confirmPass = confirmPass;
  }

  reset() {
    this._password = '';
    this._confirmPass = '';
  }
}
