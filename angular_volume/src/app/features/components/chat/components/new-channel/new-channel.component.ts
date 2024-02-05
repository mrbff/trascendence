import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
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
  selectedGroupType: string = 'private';
  password: string = '';

  constructor(
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly httpClient: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private activatedRoute: ActivatedRoute) {
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
      this.errorMsg = '';
      this.channelUsers = [];
      this.channelName = '';
      this.search = '';
      this.dialog.close();
    } else {
      this.isOpen = true;
      this.dialog.show();
    }
  }

  addUser() {
    if (this.search !== '') {
      if (this.search === this.userService.getUser()) {
        this.placeholder = 'You cant add yourself';
        this.search = '';
        this.resetPlaceholder();
        return;
      }
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

  async createNewChannel() {
    if (this.channelName !== '') {
      const ch = await this.chatGateway.getChannelByNameHttp(this.channelName)
      const user = await this.userService.getUserByUsernamePromise(this.channelName)
      //console.log(user);
      if (user !== null) {
        this.errorMsg = 'Channel name cant be a user name';
        this.channelName = '';
        return;
      }
      if (ch !== null) {
        this.errorMsg = 'Channel name already exists';
        this.channelName = '';
        return;
      }
      if (this.channelUsers.length !== 0) {
        this.errorMsg = '';
        this.chatGateway.createNewChannel(this.channelName, this.channelUsers, this.userService.getUser(), this.selectedGroupType, this.password);
        this.chatGateway.receiveUserChannels(this.userService.getUser())
        this.changeDialogStatus();
      } else {
        this.errorMsg = 'Insert channel users';
        this.channelName = '';
      }
    } else {
      this.errorMsg = 'Insert channel name';
      this.channelUsers = [];
    }
    this.channelUsers = [];
  }

}
