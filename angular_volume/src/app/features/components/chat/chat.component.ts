import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private subs: Subscription;
  errorMsg!: string;
  

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly chatGateway: ChatGateway
  ) {
    this.subs = new Subscription();
  }

  ngOnInit(): void {
    this.subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (response) => {
          console.log(`${response as string}`);///debug
        },
        error: () => {
          this.errorMsg = `MsgFromChannel failed`;
        },
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  sendMessageToChannel() {
    this.chatGateway.sendBroadcastChannel();
  }
}
