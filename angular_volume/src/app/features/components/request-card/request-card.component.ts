import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.css'],
})
export class RequestCardComponent implements OnInit {
  /* @Input() username: string; */
  profileImage: string;
  username: string;

  constructor() {
    this.profileImage =
      'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif';
    this.username = 'MARASCO';
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
