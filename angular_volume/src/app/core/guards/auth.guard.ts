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
		if (!cookieService.get('user')) {
			router.navigate(['/login']);
			return false;
		}
		const nbr = await userService.getNumberOfConnections().catch((err) => {  console.error('Error auth expired'); return 0; })
		if (nbr > 0){
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
