import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import {InvitesService} from 'src/app/core/services/game-invite.service'

@Component({
  selector: 'app-invite-card',
  templateUrl: './invite-card.component.html',
  styleUrls: ['./invite-card.component.css'],
})
export class InviteCardComponent implements OnInit {
  @Input() username: string;
  @Output() reload = new EventEmitter<void>();
  profileImage!: string;

  constructor(
    private readonly inviteService: InvitesService,
    private readonly router: Router
  ) {
    this.username = '';
  }

  async ngOnInit() {
    await this.inviteService
      .getInvitesRecv()
      .then((resp) => {
        this.profileImage = resp.img;
      })
      .catch((err) => console.error(err));
  }

  async onAccept() {
    await this.inviteService
      .acceptInvite(this.username)
      .then(() => this.reload.emit());
  }

  // async onRefuse() {
  //   await this.friendService
  //     .rejectFriend(this.username)
  //     .then(() => this.reload.emit());
  // }

  openProfile() {
    this.router.navigate(['/transcendence/profile', this.username]);
  }
}
