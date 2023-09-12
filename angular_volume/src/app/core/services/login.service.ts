import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';

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

  login(email: string, password: string) {
    if (email === 'prova' && password === '123'){
      this.setUser(email);
      return 200;
    }
    else
      return 403;
    //return this.http.post('http://localhost:3000/auth/login', { email, password });
  }
}
