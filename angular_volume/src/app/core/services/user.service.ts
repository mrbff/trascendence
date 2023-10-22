import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, lastValueFrom } from 'rxjs';
import { UserData } from 'src/app/models/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService,
    private readonly auth: AuthService
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

  setUserId(decodedJwt: any) {
    this.cookieService.set('id', decodedJwt.userId);
  }

  getUserId(): string {
    return this.cookieService.get('id');
  }

  removeUserId() {
    this.cookieService.delete('id');
  }

  async login(email: string, password: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/auth/login`, { email: email, password: password })
    );
  }

  async registerUser(userData: UserData): Promise<any> {
    return lastValueFrom(this.http.post(`/nest/users/signup`, userData));
  }

  async getUserInfo(id: string): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/users/${id}`));
  }

  async getFriendInfo(username: string): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/${username}`));
  }
}
