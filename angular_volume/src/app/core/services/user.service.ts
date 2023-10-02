import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  registerUser(userData: UserData): Observable<any> {
    return this.http.post(`http://nest:3000/auth/register`, userData);
  }
}
