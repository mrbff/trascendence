import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { channel } from 'diagnostics_channel';

@Component({
  selector: 'app-password',
  templateUrl: './leave-channel.component.html',
  styleUrls: ['./leave-channel.component.css'],
})
export class LeaveChannelComponent {
@Input() channelName: string | undefined;
leftButton: any;
rightButton: any;
leaveMsg: any;

  constructor(
    public dialogRef: MatDialogRef<LeaveChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { channelName: string }
  ) {
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }


  onSubmitClick(): void {
    this.dialogRef.close(true);
  }
}
