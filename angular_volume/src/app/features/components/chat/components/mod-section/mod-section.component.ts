import { UserService } from 'src/app/core/services/user.service';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Component, OnInit } from '@angular/core';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription, skip, take, map } from 'rxjs';
import { channel } from 'diagnostics_channel';

@Component({
  selector: 'app-mod-section',
  templateUrl: './mod-section.component.html',
  styleUrls: ['./mod-section.component.css'],
})
export class ModSectionComponent implements OnInit {

  private $subs = new Subscription();

  isOpen: boolean;
  userList: string[];
  queryParams: {[key:string]:string} = {}
  users: string[];
  id: string;
  
  constructor(
    private dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly chatGateway: ChatGateway,
  ) {
    this.id = '';
    this.userList = [];
    this.users = [];
    this.isOpen = false;
  }

  ngOnInit() {
    this.$subs.add(
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        if (params['id'] !== undefined) {
          this.id = params['id'];
          this.chatGateway.getUserList(params['id']).pipe(take(1)).subscribe((list) => {
            this.userList = list.usernames;
          });
          this.chatGateway.getFullUsersListName(params['id']).pipe(take(1)).subscribe((list) => {
           this.users = list;
          });
        }
      })
    );
  }

  OnDestroy() {
    this.$subs.unsubscribe();
  }

  changeDialogStatus() {
    this.isOpen = !this.isOpen;
  }

  changePassword( ) {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: { password: '', channelType: 'PRIVATE', id: this.id}
    });
    dialogRef.afterClosed().subscribe(( ) => {
    });
  }

  addUser() {
    console.log( "users", this.users, "channelUsers", this.userList, "id", this.id);
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: { users: this.users, channelUsers: this.userList, id: this.id},
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }
}