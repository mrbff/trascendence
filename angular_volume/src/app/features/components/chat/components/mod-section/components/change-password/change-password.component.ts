import { UserService } from 'src/app/core/services/user.service';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  username: string;
  private $subs = new Subscription();
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { password: string, channelType: string, id: string } = { password: '', channelType: 'PRIVATE', id: ''},
    private readonly chatGateway: ChatGateway,
    private readonly userService: UserService
  ) {
    this.username = this.userService.getUser();
  }

  OnDestroy() {
    this.$subs.unsubscribe();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSubmitClick()  {
    this.$subs.add(
      this.chatGateway.getPasswordChannel(this.data.id).pipe(take(1)).subscribe((channel) => {
        if (channel.type !== this.data.channelType) {
          this.chatGateway.changePassword(this.data.id, this.data.password, this.data.channelType);
          if (this.data.channelType === 'PRIVATE') {
            this.chatGateway.sendModChannelMsg(`${this.username} set channel as PRIVATE`, this.data.id, this.username, 'ACTIVE');
          }
          if (this.data.channelType === 'PUBLIC') {
            if (this.data.password !== '') {
              this.chatGateway.sendModChannelMsg(`${this.username} set channel as PUBLIC WHIT password`, this.data.id, this.username, 'ACTIVE');
            } else {
              this.chatGateway.sendModChannelMsg(`${this.username} set channel as PUBLIC WHITOUT password`, this.data.id, this.username, 'ACTIVE');
            }
          }
          return ;
        }
        if (channel.password !== this.data.password) {
          this.chatGateway.changePassword(this.data.id, this.data.password, this.data.channelType);
          if (this.data.password === '') {
            this.chatGateway.sendModChannelMsg(`${this.username} REMOVE password from the channel`, this.data.id, this.username, 'ACTIVE');
          } else {
            this.chatGateway.sendModChannelMsg(`${this.username} SET NEW password channel`, this.data.id, this.username, 'ACTIVE');
          }
        }
      })
    );
    this.dialogRef.close();
  }
}
