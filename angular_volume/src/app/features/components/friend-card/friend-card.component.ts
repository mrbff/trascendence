import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { FriendsService } from '../../../core/services/friends.service';
import { Router } from '@angular/router';
import { UserLoggedModel } from 'src/app/models/userLogged.model';

@Component({
  selector: 'app-friend-card',
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent implements OnInit, AfterViewInit {
  @Input() username: string;
  @Input() topVh: boolean;

  user!: UserLoggedModel;
  win!: string;
  status!: any;

  constructor(
    private readonly friendsService: FriendsService,
    private readonly router: Router
  ) {
    this.username = '';
    this.topVh = true;
  }

  async ngOnInit() {
    await this.friendsService
      .getFriendInfo(this.username)
      .then((user) => {
        this.user = user;
      })
      .catch((err) => console.error(err));
  }

  ngAfterViewInit() {
    this.status = document.querySelector('.profile-img');
    let height: any = document.querySelector('.card-box');
    if (this.topVh === true) {
      height.style.top = '14vh';
    } else {
      height.style.top = '20vh';
    }
  }

  openFriendProfile() {
    this.router.navigate(['/trascendence/profile', this.username]);
  }
}
