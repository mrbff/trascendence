import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private $subs = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list

  search: string;
  placeholder: string;
  isOpen: boolean;
  title: string;
  showMsg: boolean;
  screenW: any;

  chat: any[];

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
  }

  constructor(
    readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute
  ) {
    this.showMsg = false;
    this.chat = [];
    this.search = '';
    this.placeholder = 'Search user or channel';
    this.isOpen = false;
    this.title = 'CHAT';
  }

  ngOnInit(): void {
    this.screenW = window.innerWidth;
    console.log(this.screenW);
    this.initializeChat();
  }

  initializeChat(): void {
    // OPEN USER CHAT IF USERNAME IN QUERY PARAMS
    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        const username = params['username'];
        if (username !== undefined) {
          this.openChat(username);
          this.title = username;
          this.isOpen = true;
        }
      })
    );

    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (message) => {
          this.messages.push(message);
          console.log(message); ///debug
          console.log(this.messages);
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onMsgFromPriv().subscribe({
        next: (message) => {
          this.messages.push(message);
          console.log(message); ///debug
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from user: ${error.message}`;
        },
      })
    );

    // To DO: $subscribe user joining, leaving, etc.
  }

  sendMessageToChannel(channel: string): void {
    if (this.newMessage.trim()) {
      this.chatGateway.sendChannelMsg(this.newMessage, channel);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  sendMessageToUser(receiver: string): void {
    if (this.newMessage.trim()) {
      this.chatGateway.sendPrivMsg(this.newMessage, receiver);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  ngOnDestroy(): void {
    this.$subs.unsubscribe();
  }

  // TO DO: handling user joining, leaving, etc.

  // WIP
  openChat(username: string) {
    this.chat = this.messages
      .filter((obj) => obj.username === username)
      .map((obj) => obj.chat)
      .flat();
    this.isOpen = true;
    this.title = username;
  }

  searchChat() {
    if (this.search !== '' && this.search !== this.userService.getUser()) {
      if (
        this.messages.filter((obj) => obj.username === this.search).length !== 0
      ) {
        this.openChat(this.search);
      } else {
        this.placeholder = 'Chat not found';
        setTimeout(() => {
          this.placeholder = 'Search user or channel';
        }, 2000);
      }
    }
    this.search = '';
  }

  backClick() {
    this.isOpen = false;
    this.title = 'chat';
    console.log('TKM');
  }
}

//per le richeste posrman