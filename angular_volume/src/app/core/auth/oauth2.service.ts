import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  private apiUrl: string;
  constructor(private route: ActivatedRoute, private auth: AuthService) {
    this.apiUrl = '';
  }

  redirectUser() {
    window.location.href = this.apiUrl;
  }

  async getAuthCode() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.auth.saveToken(code);
      }
    });
  }
}
