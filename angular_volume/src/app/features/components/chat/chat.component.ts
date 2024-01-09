import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { channel } from 'diagnostics_channel';
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
    this.messages = [];
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

    const params = this.route.snapshot.queryParams;
    console.log('params');
    console.log(params);

    this.initializeChat();
  }

  initializeChat(): void {
    // OPEN USER CHAT IF USERNAME IN QUERY PARAMS
    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        const username = params['username'];
        if (username !== undefined) {
          this.title = username;
          this.isOpen = true;
          this.chatGateway.receivePrivChannelMsg(username)
        }
      })
    );

    // this.$subs.add(
    //   this.chatGateway.
    
    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (messages: any) => {
          // this.messages.concat(messages); 
          this.messages = [...this.messages, ...messages];
          console.log({messages}); ///debug
          console.log(this.messages);
          this.chatGateway.receiveUserChannels(this.userService.getUser())
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

    this.$subs.add(
      this.chatGateway.onUserChannelList().subscribe({
        next: (data: any) => {
          const myUsername = this.userService.getUser();
          this.channels = data.channels.map((channel:any)=> {
            if (!channel.name){
              const otherUser = channel.members.find((m: any)=> m.user.username != myUsername);
              channel.name = otherUser.user.username;
            }
            return channel;
          }); 
          console.log({chat:this.channels})
        },
        error: (error) => {
          this.errorMsg = `Error receiving channel list`;
        },
      })
    );
    this.chatGateway.receiveUserChannels(this.userService.getUser())

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
      const sender = ''; // Declare the 'sender' variable
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
    const newChat = {};

    this.chat = this.messages
    .filter((obj) => obj.username === username)
    .map((obj) => obj.chat)
    console.log({messages:this.messages, chat:this.chat})
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