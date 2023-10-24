import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent implements OnInit, AfterViewInit {
  search: string;
  placeholder: string;
  searchBox!: any;
  users: any;
  container!: any;
  friend: boolean;
  noFriends: boolean;
  friendRequests: any;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.search = '';
    this.placeholder = 'Search player';
    this.friend = true;
    this.noFriends = true;
  }

  async ngOnInit() {
    await this.loadFriend();
  }

  ngAfterViewInit(): void {
    this.searchBox = document.querySelector('#search');
    this.container = document.querySelector('.card-box');
  }

  async searchPlayer() {
    await this.friendsService
      .getFriendInfo(this.search)
      .then((response) => {
        this.router.navigate(['/profile', response.username]);
      })
      .catch(() => {
        this.placeholder = 'User not found';
        this.searchBox.classList.add('red');
        setTimeout(() => {
          this.placeholder = 'Search player';
          this.searchBox.classList.remove('red');
        }, 2000);
      });
    this.search = '';
  }

  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    this.container.scrollLeft += event.deltaY;
  }

  async loadFriend() {
    await this.friendsService
      .getFriends()
      .then((resp) => {
        this.noFriends = resp.length === 0 ? true : false;
        this.users = resp;
      })
      .catch((err) => console.error(err));
    await this.friendsService
      .getFriendRequests()
      .then((resp) => {
        this.friend = resp.length !== 0 ? true : false;
        this.friendRequests = resp;
      })
      .catch((err) => console.error(err));
  }
}
