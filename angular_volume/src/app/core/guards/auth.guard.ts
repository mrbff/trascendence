import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = async () => {
	const router: Router = inject(Router);
	const userService: UserService = inject(UserService);
	const auth: AuthService = inject(AuthService);
  
	try {
		console.log('authGuard activated');
	  await userService.getUserInfo();
	  if (auth.getLocalToken() !== sessionStorage.getItem('token') && sessionStorage.getItem('token') === null ){
		router.navigate(['/login']);
		return false;
	  }
	  return true;
	} catch (error) {
	  userService.deleteAllCookie();
	  router.navigate(['/login']);
	  return false;
	}
  };
