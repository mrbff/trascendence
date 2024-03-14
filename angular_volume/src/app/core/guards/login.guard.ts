import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = async () => {
  const auth: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  //console.log('loginGuard');
  if (auth.getToken() === '') {
    return true;
  } else {
    router.navigate(['/transcendence/home/']);
    return false;
  }
};
