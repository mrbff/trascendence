import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-password',
  templateUrl: './game-invite.component.html',
  styleUrls: ['./game-invite.component.css'],
})
export class GameInviteComponent {
leaveMsg: any;

  constructor(
    public dialogRef: MatDialogRef<GameInviteComponent>,
  ){}

  normalMode(): void {
    this.dialogRef.close("normal");
  }


  powerMode(): void {
    this.dialogRef.close("special");
  }
}
