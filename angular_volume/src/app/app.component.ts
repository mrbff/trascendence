import { Component, HostListener } from '@angular/core';
import { StatusService } from './core/services/status.service';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
	title = 'angular';
	constructor(
		private userStatus: StatusService,
		private userService: UserService,) {}


	@HostListener('window:beforeunload', ['$event'])
	beforeUnloadHander() {
		const userId = this.userService.getUserId();
		if (userId){
			this.userStatus.setStatus(userId, false);
		}
	}

	@HostListener('window:load', ['$event'])
	reload() {
		const userId = this.userService.getUserId();
		if (userId) {
			this.userStatus.setStatus(userId, true);
		}
	}
}
