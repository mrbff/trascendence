import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { lastValueFrom } from 'rxjs';
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

  setUserAvatar(link: string) {
    this.cookieService.set('avatar', link);
  }

  getUserAvatar(): string {
    return this.cookieService.get('avatar');
  }

  removeUserAvatar() {
    this.cookieService.delete('avatar');
  }

  setUserId(decode: any) {
    this.cookieService.set('id', decode.userId);
  }

  getUserId(): string {
    return this.cookieService.get('id');
  }

  removeUserId() {
    this.cookieService.delete('id');
  }

  async login(email: string, password: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/auth/login`, { email: email, password: password })
    );
  }

  async registerUser(userData: UserData): Promise<any> {
    return lastValueFrom(this.http.post(`/users/signup`, userData));
  }
}
