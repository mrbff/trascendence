import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-profile-image',
  templateUrl: './chatprofile-image.component.html',
  styleUrls: ['./chatprofile-image.component.css'],
})
export class ChatProfileImageComponent implements OnInit{
  @Input() conversation: any;
  @Input() user!: any;

  constructor(
  ) { 
  }

  ngOnInit(): void {
    //console.log(this.conversation);
  }
}
