import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { lastValueFrom } from 'rxjs';
import { UserData } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private avatar: string;

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {
    this.avatar = '';
  }

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
    this.avatar = link;
  }

  getUserAvatar(): string {
    return this.avatar;
  }

  removeUserAvatar() {
    this.avatar = '';
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
