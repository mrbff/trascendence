import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';

@Injectable({
  providedIn: 'root',
})
export class OAuth2Service {
  constructor(private http: HttpClient) {}

  redirectUser(link: string) {
    window.location.href = link;
  }

  async codeForAccessToken(code: string): Promise<any> {
    //console.log('codeForAccessToken:', code);
    try {
      const response = await lastValueFrom(this.http.post('/nest/auth/42', { code }).pipe(
        catchError((error) => {
          // Handle the error here or rethrow it
          console.error('HTTP request error :)');
          throw error;
        })
      ));
  
      return response;
    } catch (error) {
      // Handle any errors that occurred during the try block
      console.error('Error in codeForAccessToken:', error);
      throw error;
    }
  }
}
