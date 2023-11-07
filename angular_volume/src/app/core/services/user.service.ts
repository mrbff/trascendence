import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { lastValueFrom } from 'rxjs';
import { LoginModel } from 'src/app/models/login.model';
import { UserLoggedModel } from 'src/app/models/userLogged.model';

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

  async registerUser(userData: LoginModel): Promise<any> {
    return lastValueFrom(this.http.post(`/nest/users/signup`, userData));
  }

  async getUserInfo(): Promise<UserLoggedModel> {
    return lastValueFrom(this.http.get<UserLoggedModel>(`/nest/users/me`));
  }

  async getAllUsers(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/users/`));
  }
}
