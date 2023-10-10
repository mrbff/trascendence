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
    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7cad452637e7c977d04ac2f73be9b8572561822551f214cc53608c09b230a9df&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin&response_type=code';
  }

  exchangeCodeForAccessToken(code: string): Observable<any> {
    return this.http.post<any>('/auth/42', { code });
  }
}
