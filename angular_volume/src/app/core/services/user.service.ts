import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, lastValueFrom } from 'rxjs';
import { UserData } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {}

  setUser(name: string) {
    this.cookieService.set('user', name);
  }

  getUser(): string {
    return this.cookieService.get('user');
  }

  removeUser() {
    this.cookieService.delete('user');
  }

  async login(email: string, password: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/auth/login`, { email: email, password: password })
    ).catch((error) => {
      throw error;
    });
  }

  async registerUser(userData: UserData): Promise<any> {
    return lastValueFrom(this.http.post(`/users/signup`, userData)).catch(
      (error) => {
        throw error;
      }
    );
  }
}
