import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from 'src/enviroments/enviroment';
import { Observable, lastValueFrom } from 'rxjs';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  redirectUser() {
    window.location.href = 'http://localhost:8080/auth/42';
  }

  exchangeCodeForAccessToken(code: string): Observable<any> {
    return this.http.post<any>('/auth/callback', { code });
  }
}
