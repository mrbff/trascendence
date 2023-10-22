import { Component, OnInit } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent implements OnInit {
  username: string;
  win!: string;
  lose!: string;

  constructor(private readonly friendsService: FriendsService) {
    this.username = 'FRANCO';
    this.win = '0';
    this.lose = '0';
  }

  ngOnInit(): void {}
}
