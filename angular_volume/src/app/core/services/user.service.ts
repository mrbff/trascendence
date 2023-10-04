import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { UserData } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  setUser(name: string) {
    localStorage.setItem('user', name);
  }

  getUser(): string | null {
    return localStorage.getItem('user');
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
