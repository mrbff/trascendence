import { Component } from '@angular/core';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent {
  username: string;
  win!: string;
  lose!: string;

  constructor() {
    this.username = 'FRANCO';
    this.win = '0';
    this.lose = '0';
  }
}
