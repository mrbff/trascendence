import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-mod-section',
  animations: [
    trigger('openClose', [
      state('open', style({
		right: '3%',
		top: '82%',
		scale: 1,
      })),
      state('closed', style({
		right: '3%',
		top: '90%',
		scale: 0.1,
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ]),
  ],
  templateUrl: './mod-section.component.html',
  styleUrls: ['./mod-section.component.css'],
})
export class ModSectionComponent implements OnInit {

  private $subs = new Subscription();

  isOpen: boolean;
  queryParams: {[key:string]:string} = {}
  users: string[];
  id: string;
  
  constructor(
    private dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly chatGateway: ChatGateway,
    private elRef: ElementRef,
  ) {
    this.id = '';
    this.users = [];
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      // Chiudi isOpen se l'elemento cliccato non è all'interno del componente
      this.isOpen = false;
    }
  }
  ngOnInit() {
    this.$subs.add(
      this.route.queryParams.pipe(take(1)).subscribe((params) => {
        if (params['id'] !== undefined) {
          this.id = params['id'];
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
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: { users: this.users, id: this.id},
    });
    dialogRef.afterClosed().subscribe(() => {
    });
  }
}
