import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { channel } from 'diagnostics_channel';
import { Subscription, take } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';


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
  msgToShow: string | null = null;
  screenW: any;

  queryParams: {[key:string]:string} = {}
  chat: any[];

  selectedChannel: any

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
  }
  constructor(
    readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute, 
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.messages = [];
    this.chat = [];
    this.search = '';
    this.placeholder = 'Search user or channel';
    this.isOpen = false;
    this.title = 'CHAT';
  }




  ngOnInit(): void {
    this.messages = [];
    this.screenW = window.innerWidth;
    console.log(this.screenW);

    const params = this.route.snapshot.queryParams;
    console.log('params');
    console.log(params);

    this.initializeChat();
  }

  private onUserNotFound(){
    this.msgToShow = "USER NOT FOUND"
    setTimeout(()=> this.msgToShow = null, 2500);
  }

  initializeChat(): void {
    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        this.queryParams = params;
        const id = params['id'];
        const username = params['username'];
        if (username !== undefined) {
          this.userService.getUserByUsername(username).pipe(take(1)).subscribe({
            next:(user)=>{
              if (!user) {  
                return this.onUserNotFound()
              }

              this.title = username;
              this.isOpen = true;
              this.chatGateway.receivePrivChannelMsg(username, undefined);
            },
            error:(err)=>{
              this.onUserNotFound();
            }
          })
        } else if (id !== undefined) {
          this.chatGateway.receivePrivChannelMsg(undefined, id);
        }
        this.$subs.add(
          this.chatGateway.onReceiveMsgForChannel().subscribe({
            next: (messages: any) => {
              this.messages = messages;
            },
            error: (error) => {
              this.errorMsg = `Error receiving message from channel: ${error.message}`;
            },
          })
        )
      this.isOpen = true;
      })
    );
    
    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (messages: any) => {
          this.messages = [...this.messages, ...messages.filter((message:any)=>{
            if (!this.selectedChannel){
              return message.members?.every((mem:string)=>mem === this.queryParams['username'] || mem === this.userService.getUser())
            }
            return (this.selectedChannel.id === message.channelId);
          })];
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );


    // this.$subs.add(
    //   this.chatGateway.onMsgFromPriv().subscribe({
    //     next: (message) => {
    //       this.messages.push(message);
    //     },
    //     error: (error) => {
    //       this.errorMsg = `Error receiving message from user: ${error.message}`;
    //     },
    //   })
    // );

    this.$subs.add(
      this.chatGateway.onUserChannelList().subscribe({
        next: (data: any) => {
          const myUsername = this.userService.getUser();
          this.channels = data.channels.map((channel:any)=> {
            let isGroup = true;
            if (!channel.name){
              isGroup = false;
              const otherUser = channel.members.find((m: any)=> m.user.username != myUsername);
              channel.name = otherUser.user.username;
            }
          
          return {...channel,
                  isGroup,};
          }); 
          if (this.queryParams['username']){
            this.selectedChannel = this.channels?.find((ch:any)=>{
              return ch.name === this.queryParams['username']
            })
            console.log(this.selectedChannel)
          } else if (this.queryParams['id']){
            this.selectedChannel = this.channels?.find((ch:any)=>ch.id === this.queryParams['id'])
          }
          // console.log({chat:this.channels})
        },
        error: (error) => {
          this.errorMsg = `Error receiving channel list`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onCreatedNewPublicChannel().subscribe({
        next: (data: any) => {
          this.channels.push(data);
          this.selectedChannel = data;
        }
      })
    )
    this.chatGateway.receiveUserChannels(this.userService.getUser())

    // To DO: $subscribe user joining, leaving, etc.
  }

  sendMessageToChannel(): void {
    if (this.newMessage.trim()) {
      let id = this.queryParams['id'];
      if (this.selectedChannel)
        id = this.selectedChannel.id;
      this.chatGateway.sendChannelMsg(this.newMessage, id);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  sendMessageToUser() {
    if (this.newMessage.trim()) {
      if (this.queryParams['username'])
        this.chatGateway.sendPrivMsg(this.newMessage, this.queryParams['username']);
      else if(this.queryParams['id'])
        this.sendMessageToChannel();
      this.newMessage = ''; // Reset the input after sending
    }
  }

  ngOnDestroy(): void {
    this.$subs.unsubscribe();
  }

  // TO DO: handling user joining, leaving, etc.

  openChat(conversation: any) {
    if (this.queryParams['id'] === conversation.id)
      return;
    this.messages = [];
    this.router.navigate(
      [], 
      {
        relativeTo: this.activatedRoute,
        queryParams: {id:conversation.id},
      }
    );
    this.selectedChannel = conversation;
    this.msgToShow = null;
  }

  searchChat() {
    if (this.search !== '' && this.search !== this.userService.getUser()) {
      this.router.navigate(
        [], 
        {
          relativeTo: this.activatedRoute,
          queryParams: {username:this.search}, 
        }
      );
      this.msgToShow = null;
      } else {
        this.placeholder = 'Chat not found';
        setTimeout(() => {
          this.placeholder = 'Search user or channel';
        }, 2000);
      }
      this.search = '';
  }

  backClick() {
    this.isOpen = false;
    this.title = 'chat';
    console.log('TKM');
  }
}