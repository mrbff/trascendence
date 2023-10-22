import { Component } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';

@Component({
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent {
  search: string;

  constructor(private readonly friendsService: FriendsService) {
    this.search = '';
  }

  async searchPlayer() {
    await this.friendsService
      .getFriendInfo(this.search)
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
    this.search = '';
  }
}
