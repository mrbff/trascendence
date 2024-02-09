import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mod-section',
  templateUrl: './mod-section.component.html',
  styleUrls: ['./mod-section.component.css'],
})
export class ModSectionComponent implements OnInit, AfterViewInit {
  isOpen: boolean;

  constructor(
    private dialog: MatDialog
  ) {
    this.isOpen = false;
  }

  async ngOnInit() {
  }

  ngAfterViewInit(): void {
  }

  changeDialogStatus() {
    this.isOpen = !this.isOpen;
  }

  changePassword( ) {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: { password: '' }
    });
    dialogRef.afterClosed().subscribe((password: string) => {
    });
  }

  addUser( ) {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      data: { password: '' }
    });
    dialogRef.afterClosed().subscribe((password: string) => {
    });
  }
}