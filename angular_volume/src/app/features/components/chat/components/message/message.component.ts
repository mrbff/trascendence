import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';
import { Router } from '@angular/router';

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
  isInvite = false;

  constructor(private readonly userService: UserService, private readonly router: Router) {
    this.currentUser = false;
    this.otherUser = false;
    this.isModerator = false;
  }

  ngOnInit() {
    if (this.message.isModer == true) {
      this.isModerator = true;
      return;
    }
    if (this.message.isInvite == true){
      this.isInvite = true;
    }
    this.username = this.message.user;
    if (this.username !== this.userService.getUser()) {
      this.currentUser = false;
      this.otherUser = true;
    } else {
      this.currentUser = true;
      this.otherUser = false;
    }
  }

  redirectToGame() {
    this.router.navigate(['/trascendence/pong'], {queryParams: {invited: this.message.msg}} )
  }
}
