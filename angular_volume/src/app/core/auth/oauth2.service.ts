import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from 'src/enviroments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  private apiUrl: string;
  constructor(private route: ActivatedRoute, private auth: AuthService, private http: HttpClient) {
    this.apiUrl = environment.ftApiUrl;
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
