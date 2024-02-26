import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';
import {InvitesService} from 'src/app/core/services/game-invite.service'
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

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
  inv: boolean;
  noFriends: boolean;
  friendRequests: any;
  invites: any;

  @HostListener('document:keydown.enter', ['$event'])
  enterKeyPressed(event: KeyboardEvent) {
    event.preventDefault();
    this.searchPlayer();
  }

  private loadInvitesSubscription!: Subscription;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly inviteService: InvitesService,
    private readonly router: Router,
  ) {
    this.search = '';
    this.placeholder = 'Search player';
    this.friend = false;
	this.inv = false;
    this.noFriends = true;
  }

  ngOnInit() {
    this.loadFriend();
    this.loadInvitesSubscription = interval(1000).pipe(
      startWith(0), // So that it runs immediately as well
      switchMap(() => this.loadInvites())
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.loadInvitesSubscription) {
        this.loadInvitesSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    this.searchBox = document.querySelector('#search');
    this.cardContainer = document.querySelector('.card-box');
    this.requestContainer = document.querySelector('.request-box');
  }

  async loadFriend() {
    await this.friendsService
      .getFriendRequestsRecv()
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

  async loadInvites(){
    await this.inviteService
      .getInvitesRecv()
      .then((resp) => {
        this.inv = resp.length !== 0 ? true : false;
        this.invites = resp;
      })
  }

  async searchPlayer() {
    if (this.search !== '') {
      await this.friendsService
        .getFriendInfo(this.search)
        .then((response) => {
          this.router.navigate(['/transcendence/profile', response.username]);
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
  }

  onMouseWheel(event: WheelEvent, containerType: string) {
    event.preventDefault();
    if (containerType === 'card') {
      this.cardContainer.scrollLeft += event.deltaY;
    } else if (containerType === 'request') {
      this.requestContainer.scrollLeft += event.deltaY;
    }
  }
}
