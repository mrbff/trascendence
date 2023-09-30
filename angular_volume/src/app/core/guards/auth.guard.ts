import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth: AuthService = new AuthService();
  const router: Router = new Router();
  if (auth.getToken() !== null) {
    return true;
  } else {
    return router.navigate(['/login']);
  }
};
