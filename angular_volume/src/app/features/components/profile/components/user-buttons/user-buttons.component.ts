import { Component, Input } from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';

@Component({
  selector: 'app-user-buttons',
  templateUrl: './user-buttons.component.html',
  styleUrls: ['./user-buttons.component.css'],
})
export class UserButtonsComponent {
  @Input() username!: string;
  @Input() isFriend!: boolean;
  @Input() isBlocked!: boolean;

  constructor(private readonly friendsService: FriendsService) {}

  async addFriend() {
    await this.friendsService
      .addFriend(this.username)
      .then(() => (this.isFriend = true));
  }

  async removeFriend() {
    await this.friendsService
      .deleteFriend(this.username)
      .then(() => (this.isFriend = false));
  }

  async blockUser() {
    await this.friendsService
      .blockUser(this.username)
      .then(() => (this.isBlocked = true));
  }

  async unblockUser() {
    await this.friendsService
      .unblockUser(this.username)
      .then(() => (this.isBlocked = false));
  }
}
