import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { StatusService } from '../../../core/services/status.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private readonly userService: UserService,
    private readonly status: StatusService
  ) {}

  ngOnInit(): void {}

  @HostListener('document:keydown.enter', ['$event'])
  enterKeyPressed(event: KeyboardEvent) {
    event.preventDefault();
    console.log('PRESSED');
  }
}
