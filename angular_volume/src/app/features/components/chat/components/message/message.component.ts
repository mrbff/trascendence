import { Component, Input, OnInit, OnDestroy, NgModule, ɵɵgetCurrentView } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { InvitesService } from 'src/app/core/services/game-invite.service';
import { Observable, interval, Subscription, map } from 'rxjs';
import { CodeService } from 'src/app/shared/services/code.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input() message: any;
  username!: string;
  currentUser!: boolean;
  otherUser!: boolean;
  isModerator!: boolean;
  currentTime$: Observable<Date>;
  private subscription: Subscription;
  ms: number;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly inviteService: InvitesService) {
    this.currentUser = false;
    this.ms = 0;
    this.otherUser = false;
    this.isModerator = false;
    this.subscription = new Subscription();
    this.currentTime$ = new Observable<Date>();
  }

  ngOnInit() {
    this.currentTime$ = interval(1000).pipe(
      map(() => {
        const currentDate = new Date();
        currentDate.setTime(currentDate.getTime() - 10000);
        return currentDate;
      })
    );
    this.subscription = this.currentTime$.subscribe(value => {
      this.ms = value.getMilliseconds();
    });
    if (this.message.isModer == true) {
      this.isModerator = true;
      return;
    }
    this.username = this.message.user;
    if (this.username !== this.userService.getUser()) {
      this.currentUser = false;
      this.otherUser = true;
    } else {
      this.currentUser = true;
      this.otherUser = false;
    }
    if (this.message.isInvite == 'PENDING') {
      console.log('Current Time:', this.ms);
      const msgToms = Date.parse(this.message.time);
      console.log('Message Time:', msgToms);
      const changeTime  = this.ms - msgToms;
      console.log('Time:', changeTime);
      setTimeout(() => {this.message.isInvite = 'OUTDATED'}, changeTime);
  }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  redirectToGame() {
  this.router.navigate(['/transcendence/pong'], {queryParams: {invited: this.message.msg}})
	if (!this.currentUser)
		this.inviteService.acceptInvite(this.username);
  }
}
