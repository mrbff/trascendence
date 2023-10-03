import { Body } from '@nestjs/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, lastValueFrom } from 'rxjs';
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

  login(user: UserData): Observable<any> {
    return this.http.post('api/users', { user });
  }

  async registerUser(userData: UserData): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.http.post(`/users/signup`, userData, {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        })
      );
      console.log(`promise: ${response}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
