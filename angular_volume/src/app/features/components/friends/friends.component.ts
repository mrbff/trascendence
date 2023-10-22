import { Component } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent {
  search: string;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.search = '';
  }

  async searchPlayer() {
    await this.friendsService
      .getFriendInfo(this.search)
      .then((response) => {
        console.log(response);
        this.router.navigate(['/profile', response.username]);
      })
      .catch((err) => console.error(err));
    this.search = '';
  }
}
