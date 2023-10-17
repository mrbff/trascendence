import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class HeaderInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const modifiedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        Authorization: `Bearer ${this.auth.getToken()}`,
      },
    });
    return next.handle(modifiedRequest);
  }
}
