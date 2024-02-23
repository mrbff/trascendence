import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { channel } from 'diagnostics_channel';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';
import { Router } from '@angular/router';
import { InvitesService } from 'src/app/core/services/game-invite.service';
import { Observable, interval, Subscription, map, take } from 'rxjs';

class Pending {
  status: boolean = false;
  sender: string = '';
  reciver: string = '';
  time: number = 0;
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input() message: any;
  @Input() members: any;
  @Output() pendingEvent: EventEmitter<Pending> = new EventEmitter<Pending>();

  username!: string;
  currentUser!: boolean;
  otherUser!: boolean;
  isModerator!: boolean;
  currentTime$: Observable<number>;
  private subscription: Subscription;
  ms: number;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly chatGateway: ChatGateway,
    private readonly inviteService: InvitesService) {
    this.currentUser = false;
    this.ms = 0;
    this.otherUser = false;
    this.isModerator = false;
    this.subscription = new Subscription();
    this.currentTime$ = new Observable<number>();
  }

  ngOnInit() {
    this.currentTime$ = interval(1000).pipe(
      map(() => {
        const currentDate = Date.now();
        return currentDate - 10000;
      })
    );

    this.subscription = this.currentTime$.subscribe(value => {
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
      if (this.message.user === this.userService.getUser()) {
        var sender = this.message.user;
        var reciver = this.message.msg.split(":")[0];
      } else {
        var sender = this.message.msg.split(":")[0];
        var reciver = this.message.user;
      }
      this.currentTime$.pipe(take(1)).subscribe(value => {
        this.ms = value;
        const msgToms = Date.parse(this.message.time);
        const changeTime  = msgToms - this.ms;
        this.pendingEvent.emit({status: true, sender : sender, reciver: reciver, time: changeTime});
        setTimeout(() => {this.message.isInvite = 'OUTDATED';
          this.pendingEvent.emit({status: false, sender : sender, reciver: reciver, time: 0})}, changeTime);
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  redirectToGame() {
    this.router.navigate(['/transcendence/pong'], {queryParams: {invited: this.message.msg.split(":")[1]}})
    this.chatGateway.postChangeGameStatus(parseInt(this.message.msg.split(":")[1]) as number, 'ACCEPTED', this.message.id);
  }
}
