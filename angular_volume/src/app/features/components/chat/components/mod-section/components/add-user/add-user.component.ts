import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-adduser',
  templateUrl: 'add-user.component.html',
  styleUrls: ['add-user.component.css'],
})
export class AddUserComponent {

  private $subs = new Subscription();
  queryParams: {[key:string]:string} = {}
  search: string;
  placeholder: string;
  username: string;
  id: string;
  channelUsers: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : { users: string[], channelUsers: string[], id: string },
    public dialogRef: MatDialogRef<AddUserComponent>,
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute,
  ) {
    this.id = '';
    this.search = '';
    this.channelUsers = [];
    this.placeholder = 'Add user';
    this.username = this.userService.getUser();
  }

  ngOnInit() {
    this.$subs.add(
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        if (params['id'] !== undefined) {
          this.id = params['id'];
          this.chatGateway.getUserList(params['id']).pipe(take(1)).subscribe((list) => {
            this.channelUsers = list.usernames;
          });
        }
      })
    );
  }

  OnDestroy() {
    this.$subs.unsubscribe();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  addUser() {
    if (this.search !== '') {
      if (this.search === this.userService.getUser()) {
        this.placeholder = 'You cant add yourself';
        this.search = '';
        this.resetPlaceholder();
        return;
      }
      if (this.data.users.includes(this.search)) {
        if (this.channelUsers.includes(this.search) === false) {
          this.channelUsers.push(this.search);
          this.chatGateway.addUserToChannel(this.data.id, this.search);
          this.chatGateway.sendModChannelMsg(`${this.username} ADD ${this.search} to the channel`, this.data.id, this.search, 'ACTIVE');
        } else {
          this.placeholder = 'User already into channel';
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

}
