import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-new-channel',
  templateUrl: './new-channel.component.html',
  styleUrls: ['./new-channel.component.css'],
})
export class NewChannelComponent implements OnInit, AfterViewInit {
  dialog: any;
  users!: string[];
  channelUsers: string[];
  search: string;
  placeholder: string;
  channelName: string;
  errorMsg: string;
  isOpen: boolean;

  constructor(private readonly userService: UserService) {
    this.channelUsers = [];
    this.search = '';
    this.placeholder = 'Add user';
    this.channelName = '';
    this.errorMsg = '';
    this.isOpen = false;
  }

  async ngOnInit() {
    this.users = (await this.userService.getAllUsers()).map(
      (user) => user.username
    );
  }

  ngAfterViewInit(): void {
    this.dialog = document.querySelector('.newChannel');
  }

  changeDialogStatus() {
    if (this.dialog.open) {
      this.isOpen = false;
      this.dialog.close();
    } else {
      this.isOpen = true;
      this.dialog.show();
    }
  }

  addUser() {
    if (this.search !== '') {
      if (this.users.includes(this.search)) {
        if (this.channelUsers.includes(this.search) === false) {
          this.channelUsers.push(this.search);
        } else {
          this.placeholder = 'User already into channel list';
        }
      } else {
        this.placeholder = 'User not found';
      }
      this.search = '';
      this.resetPlaceholder();
    }
  }

  resetPlaceholder() {
    setTimeout(() => {
      this.placeholder = 'Add user';
    }, 2000);
  }

  createNewChannel() {
    console.log(this.channelName);
    if (this.channelName !== '') {
      if (this.channelUsers.length !== 0) {
        this.errorMsg = '';
        // CREATE CHANNEL
        this.changeDialogStatus();
      } else {
        this.errorMsg = 'Insert channel users';
      }
    } else {
      this.errorMsg = 'Insert channel name';
    }
  }
}
