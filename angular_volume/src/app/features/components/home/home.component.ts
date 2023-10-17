import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';
import { StatusService } from '../../../core/services/status.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private readonly userService: UserService,
    private readonly status: StatusService
  ) {}

  ngOnInit(): void {
    const ID = this.userService.getUserId();
    this.status.setStatus(ID, true);
    this.userService
      .getUserInfo(ID)
      .then((user) => {
        console.log(user);
        this.userService.setUserAvatar(user.img);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
