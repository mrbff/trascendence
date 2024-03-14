import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = async () => {
	const router: Router = inject(Router);
	const userService: UserService = inject(UserService);
	const cookieService: CookieService = inject(CookieService);
	try {
		console.log('authGuard activated');
		let user = await userService.getUserInfo();
		console.log(user.isOnline);
		if (user.isOnline){
			router.navigate(['/login']);
			cookieService.delete('id');
			return false;
		}
		//console.log('true authGuard');
	  return true;
	} catch (error) {
		//console.log('false authGuard');
		userService.deleteAllCookie();
		router.navigate(['/login']);
		return false;
	}
};
