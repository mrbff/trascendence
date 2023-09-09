import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    if (email === 'prova' && password === '123')
      return 200;
    else
      return 403;
    //return this.http.post('http://localhost:3000/auth/login', { email, password });
  }
}
