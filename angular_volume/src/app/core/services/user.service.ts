import { UserInfo } from '../../models/userInfo.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { LoginModel } from 'src/app/models/login.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private $userSubject: BehaviorSubject<UserInfo>;

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {
    this.$userSubject = new BehaviorSubject<any>(null);
  }

  updateUser() {
    this.http.get<UserInfo>(`/nest/users/me`).subscribe((user) => {
      this.$userSubject.next(user);
    });
  }

  getUserObservable(): Observable<UserInfo> {
    return this.$userSubject.asObservable();
  }

  setUser(name: string) {
    this.cookieService.set('user', name, 1 / 24, '/');
  }

  getUser(): string {
    return this.cookieService.get('user');
  }

  getOther(id: string): Promise<any> {
	return lastValueFrom(this.http.get(`/nest/users/${id}`));
  }

  setUserId(decodedJwt: any) {
    this.cookieService.set('id', decodedJwt.userId, 1 / 24, '/');
  }

  getUserId(): string {
    return this.cookieService.get('id');
  }

  deleteAllCookie() {
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

  async getUserInfo(): Promise<UserInfo> {
    return lastValueFrom(this.http.get<UserInfo>(`/nest/users/me`));
  }

  async getAllUsers(): Promise<UserInfo[]> {
    return lastValueFrom(this.http.get<UserInfo[]>(`/nest/users/`));
  }

  getUserByUsername(username: string) {
    return this.http.get<UserInfo>(`/nest/users/nothrow/${username}`);
  }

  async getUserByUsernamePromise(username: string): Promise<any> {
    return lastValueFrom(this.http.get<UserInfo>(`/nest/users/promise/${username}`));
  }

  async updateWinnLoss(id: string, update: {res: string, matchId: number}) {
	return lastValueFrom(
		this.http.patch(`/nest/users/win-loss/${id}`, {update: update})
	);
  }

  async getMatchHistory(id: string): Promise<any> {
	return lastValueFrom(this.http.get(`/nest/users/matchHistory/${id}`));
  }
}
