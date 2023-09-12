import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  registerUser(userData: UserData): Observable<any> {
    return this.http.post(`http://localhost:3000/auth/register`, userData);
  }
}
