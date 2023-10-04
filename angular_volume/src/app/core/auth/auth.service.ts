import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly cookieService: CookieService) {}

  saveToken(token: string) {
    this.cookieService.set('token', token);
  }

  getToken(): string {
    console.log(`TOKEN ${this.cookieService.get('token')}`);
    return this.cookieService.get('token');
  }

  removeToken() {
    this.cookieService.delete('token');
  }
}
