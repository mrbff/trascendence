import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth: AuthService = new AuthService();
  const router: Router = new Router();
  console.log(auth.isLogged());
  if (auth.isLogged() === true) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
