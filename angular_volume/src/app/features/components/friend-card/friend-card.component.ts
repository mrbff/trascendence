import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent implements OnInit, AfterViewInit {
  @Input() username;

  win!: string;
  lose!: string;
  private userInfo!: any;
  profileImage!: string;
  isPlaying: boolean;
  isOnline: boolean;
  status!: any;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.username = 'FRANCO';
    this.win = '0';
    this.lose = '0';
    this.isOnline = false;
    this.isPlaying = false;
  }

  async ngOnInit() {
    /*  this.userInfo = await this.friendsService.getFriendInfo(this.username);
    this.profileImage = this.userInfo.img
      ? this.userInfo.img
      : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.win = this.userInfo.Wins;
    this.lose = this.userInfo.Losses;
    this.isPlaying = this.userInfo.isPlaying;
    this.isOnline = this.userInfo.isOnline;
    console.log(this.userInfo); */
  }

  ngAfterViewInit() {
    this.status = document.querySelector('.profile-img');
  }

  openFriendProfile() {
    this.router.navigate(['/profile', this.username]);
  }
}
