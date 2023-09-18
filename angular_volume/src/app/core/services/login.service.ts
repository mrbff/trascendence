import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { Observable } from 'rxjs';
import { UserData } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private http: HttpClient) { }

  setUser(name: string){
    localStorage.setItem('user', name);
  }

  getUser(): string | null {
    return localStorage.getItem('user');
  }

  login(user: UserData) : Observable<any>{
      this.setUser(user.email);
      return this.http.post('http://localhost:3000/auth/login', { user });
  }
}
