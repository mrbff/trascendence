import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular';

	@HostListener('window:beforeunload', ['$event'])
	beforeUnloadHander() {
		if (localStorage.getItem('token'))
			sessionStorage.setItem('backup', localStorage.getItem('token')!);
		localStorage.removeItem('token');
	}

	@HostListener('window:load', ['$event'])
	reaload() {
		if(sessionStorage.getItem('backup'))
			localStorage.setItem('token', sessionStorage.getItem('backup')!);
	}

}
