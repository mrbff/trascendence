import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-adduser',
  templateUrl: 'add-user.component.html',
  styleUrls: ['add-user.component.css'],
})
export class AddUserComponent {

  search: string;
  placeholder: string;
  username: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data : { users: string[], channelUsers: string[], id: string },
    public dialogRef: MatDialogRef<AddUserComponent>,
    private readonly userService: UserService,
    private readonly chatGateway: ChatGateway
  ) {
    this.search = '';
    this.placeholder = 'Add user';
    this.username = this.userService.getUser();
  }

  async OnInit() {
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  addUser() {
    console.log( "users", this.data.users, "channelUsers", this.data.channelUsers, "id", this.data.id);
    if (this.search !== '') {
      if (this.search === this.userService.getUser()) {
        this.placeholder = 'You cant add yourself';
        this.search = '';
        this.resetPlaceholder();
        return;
      }
      if (this.data.users.includes(this.search)) {
        if (this.data.channelUsers.includes(this.search) === false) {
          this.data.channelUsers.push(this.search);
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
    this.dialogRef.close();
  }

  resetPlaceholder() {
    setTimeout(() => {
      this.placeholder = 'Add user';
    }, 2000);
  }

}
