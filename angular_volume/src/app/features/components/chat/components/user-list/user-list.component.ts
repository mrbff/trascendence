import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';

@Component({
  selector: 'app-userlist',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  @Input() user: any;
  username!: string;
  currentUser!: boolean;

  constructor(private readonly userService: UserService) {}

  ngOnInit() {
    this.username = this.user.username;
    if (this.username !== this.userService.getUser()) {
      this.currentUser = false;
    } else {
      this.currentUser = true;
    }
  }
}
