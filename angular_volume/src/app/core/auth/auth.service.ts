import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  private readonly TOKEN_KEY = 'auth_token';

  saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
