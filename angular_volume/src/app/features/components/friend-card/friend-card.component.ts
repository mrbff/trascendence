import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent implements OnInit, AfterViewInit {
  @Input() username: string;

  win!: string;
  lose!: string;
  profileImage!: string;
  isPlaying: boolean;
  isOnline: boolean;
  status!: any;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.username = '';
    this.win = '0';
    this.lose = '0';
    this.isOnline = false;
    this.isPlaying = false;
  }

  async ngOnInit() {
    await this.friendsService
      .getFriendInfo(this.username)
      .then((response) => {
        console.log(response);
        this.profileImage = response.img
          ? response.img
          : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
        this.win = response.Wins;
        this.lose = response.Losses;
        this.isPlaying = response.isPlaying;
        this.isOnline = response.isOnline;
      })
      .catch((err) => console.error(err));
  }

  ngAfterViewInit() {
    this.status = document.querySelector('.profile-img');
  }

  openFriendProfile() {
    this.router.navigate(['/profile', this.username]);
  }
}
