import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly cookieService: CookieService) {}

  saveToken(token: string) {
    if (token !== undefined) {
      this.cookieService.set('token', token, 1 / 24, '/');
	  localStorage.setItem('token', token);
	  sessionStorage.setItem('token', token);
    }
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  getLocalToken() {
	return localStorage.getItem('token');
  }

  decodeToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
