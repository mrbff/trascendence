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
    this.cookieService.set('user', name, 1 / 24, '/');
  }

  getUser(): string {
    return this.cookieService.get('user');
  }

  setUserId(decodedJwt: any) {
    this.cookieService.set('id', decodedJwt.userId, 1 / 24, '/');
  }

  getUserId(): string {
    return this.cookieService.get('id');
  }

  deleteAllInfo() {
    this.cookieService.deleteAll('/');
  }

  async setUserAvatar(id: string, img: string): Promise<any> {
    return lastValueFrom(
      this.http.patch(`/nest/users/img/${id}`, { newImg: img })
    );
  }

  async login(email: string, password: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/auth/login`, { email: email, password: password })
    );
  }

  async registerUser(userData: UserData): Promise<any> {
    return lastValueFrom(this.http.post(`/nest/users/signup`, userData));
  }

  async getUserInfo(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/users/me`));
  }

  async getAllUsers(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/users/`));
  }
}
