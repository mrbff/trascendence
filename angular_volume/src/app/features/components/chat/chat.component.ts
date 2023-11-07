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
  private subs = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly chatGateway: ChatGateway
  ) {}

  ngOnInit(): void {
    this.initializeChat();
  }
  
  initializeChat(): void {
    this.subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (message) => {
          this.messages.push(message); // Assuming 'message' is already formatted
          console.log(message); // For debug purposes
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );
    
    // You might also want to subscribe to other events, such as user joining, leaving, etc.
  }

  sendMessageToChannel(): void {
    if (this.newMessage.trim()) {
      this.chatGateway.sendBroadcastChannel(this.newMessage); // Implement this method in your ChatGateway
      this.newMessage = ''; // Reset the input after sending
    }
  }
  
  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
    // Perform additional cleanup if necessary, like informing the server the user has left the chat
  }

  // Additional methods can be implemented here, such as handling user joining, leaving, etc.
}

