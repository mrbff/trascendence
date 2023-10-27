import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
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
  cardContainer!: any;
  requestContainer!: any;
  friend: boolean;
  noFriends: boolean;
  friendRequests: any;

  @HostListener('document:keydown.enter', ['$event'])
  enterKeyPressed(event: KeyboardEvent) {
    event.preventDefault();
    this.searchPlayer();
  }

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.search = '';
    this.placeholder = 'Search player';
    this.friend = false;
    this.noFriends = true;
  }

  async ngOnInit() {
    await this.loadFriend();
  }

  ngAfterViewInit(): void {
    this.searchBox = document.querySelector('#search');
    this.cardContainer = document.querySelector('.card-box');
    this.requestContainer = document.querySelector('.request-box');
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

  onMouseWheel(event: WheelEvent, containerType: string) {
    if (containerType === 'card') {
      this.cardContainer.scrollLeft += event.deltaY;
    } else if (containerType === 'request') {
      this.requestContainer.scrollLeft += event.deltaY;
    }
    event.preventDefault();
  }

  async loadFriend() {
    await this.friendsService
      .getFriendRequests()
      .then((resp) => {
        this.friend = resp.length !== 0 ? true : false;
        this.friendRequests = resp;
      })
      .catch((err) => console.error(err));
    await this.friendsService
      .getFriends()
      .then((resp) => {
        this.noFriends = resp.length === 0 ? true : false;
        this.users = resp;
      })
      .catch((err) => console.error(err));
  }
}
