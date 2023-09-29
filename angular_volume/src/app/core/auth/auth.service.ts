import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private status = false;

  constructor() {}

  isLogged(): boolean {
    return this.status;
  }

  login() {
    this.status = true;
  }

  logout() {
    this.status = false;
  }
}
