import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
})
export class PasswordComponent {
leftButton: any;
rightButton: any;

  constructor(
    public dialogRef: MatDialogRef<PasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { password: string }
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }


  onSubmitClick(password: string) {
    this.dialogRef.close(password);
  }
}
