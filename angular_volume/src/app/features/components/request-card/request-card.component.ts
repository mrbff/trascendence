import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FriendsService } from 'src/app/core/services/friends.service';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css'],
})
export class RequestCardComponent implements OnInit {
  @Input() username: string;
  @Output() reload = new EventEmitter<void>();
  profileImage!: string;

  constructor(private readonly friendService: FriendsService) {
    this.username = '';
  }

  async ngOnInit() {
    await this.friendService
      .getFriendInfo(this.username)
      .then((resp) => {
        this.profileImage =
          resp.img !== ''
            ? resp.img
            : 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
      })
      .catch((err) => console.error(err));
  }

  async onAccept() {
    await this.friendService
      .acceptFriend(this.username)
      .then(() => this.reload.emit());
  }

  async onRefuse() {
    await this.friendService
      .rejectFriend(this.username)
      .then(() => this.reload.emit());
  }
}
