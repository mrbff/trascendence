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
  friendRequest: boolean;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.search = '';
    this.placeholder = 'Search player';
    this.users = [{ name: 'franco' }, { name: 'marasco' }, { name: 'mimmo' }];
    this.friendRequest = true;
  }

  async ngOnInit() {
    /*  await this.friendsService
      .getFriends()
      .then((resp) => console.log(resp))
      .catch((err) => console.error(err)); */
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
      .catch((err) => {
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
}
