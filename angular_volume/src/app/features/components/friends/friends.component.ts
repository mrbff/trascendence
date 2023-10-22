import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user.service';

@Component({
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
})
export class FriendsComponent {
  search: string;

  constructor(private readonly userService: UserService) {
    this.search = '';
  }

  async searchPlayer() {
    await this.userService
      .getFriendInfo(this.search)
      .then((response) => console.log(response))
      .catch((err) => console.error(err));
    this.search = '';
  }
}
