import { Component, HostListener } from '@angular/core';
import { StatusService } from './core/services/status.service';
import { UserService } from './core/services/user.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
	title = 'angular';
	constructor(
		private userStatus: StatusService,
		private userService: UserService,
		private biscotti: CookieService) {}


	@HostListener('window:beforeunload', ['$event'])
	beforeUnloadHander() {
		const userId = this.userService.getUserId();
		if (userId){
			sessionStorage.setItem('backupUserId', userId);
			this.userStatus.setStatus(userId, false);
			this.biscotti.delete('id');
		}
	}

	@HostListener('window:load', ['$event'])
	reload() {
		if (sessionStorage.getItem('backupUserId')) {
			this.biscotti.set('id', sessionStorage.getItem('backupUserId')!);
		}
		const userId = this.userService.getUserId();
		if (userId) {
			this.userStatus.setStatus(userId, true);
		}
	}
}
