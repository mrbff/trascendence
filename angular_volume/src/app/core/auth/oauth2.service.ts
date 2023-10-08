import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  private apiUrl: string;
  constructor(private route: ActivatedRoute, private auth: AuthService, private http: HttpClient) {
    this.apiUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6ceeb4257a3bf0ff877ddbc99937c73c7df51fb30838b41c7176b64066a65658&redirect_uri=http%3A%2F%2F10.11.247.111%3A8080%2F%2Flogin&response_type=code';
  }

  redirectUser() {
    window.location.href = this.apiUrl;
  }

  async getAuthCode() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.http.get(`/auth/42`).subscribe({
          next: (response) => {
            console.log(response);
          }, 
          error: (error) => {
            console.log(error);
          }
        });
      }
    });
  }
}
