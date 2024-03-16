import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/core/services/status.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy{
  constructor(private readonly router: Router, private readonly userService: UserService, private readonly userStatus: StatusService) {
    const userId = this.userService.getUserId();
		//console.log('userId', userId);
		if (userId) {
			this.userStatus.setStatus(userId, true);
		}
  }
  
  ngOnInit() {
    this.userService.patchNumberOfConnections('+');
    window.onbeforeunload = () => {this.ngOnDestroy()};
  }

  ngOnDestroy() {
    this.userService.patchNumberOfConnections('-');
  }

  @HostListener('document:keydown.enter', ['$event'])
  enterKeyPressed(event: KeyboardEvent) {
    event.preventDefault();
    this.gameNavigate();
  }

  gameNavigate() {
    this.router.navigate(['/transcendence/pong/']);
  }
}
