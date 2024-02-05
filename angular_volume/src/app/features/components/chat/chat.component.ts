import { ConsoleLogger } from '@nestjs/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/models/userInfo.model';
import { get } from 'http';


@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageArea') messageArea!: ElementRef;
  private $subs = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list
  public whoami!: UserInfo;
  public userLis!: UserInfo[];


  search: string;
  placeholder: string;
  isOpen: boolean;
  title: string;
  msgToShow: string | null = null;
  screenW: any;
  allRead: boolean;
  selectedOption: string | undefined;
  isGroup: boolean;


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
    private renderer: Renderer2,
  ) {
    this.messages = [];
    this.chat = [];
    this.search = '';
    this.placeholder = 'Search user or channel';
    this.isOpen = false;
    this.title = 'CHAT';
    this.allRead = false;
    this.isGroup = false;
  }

  ngAfterViewChecked(): void {
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      this.renderer.setProperty(this.messageArea.nativeElement, 'scrollTop', this.messageArea.nativeElement.scrollHeight);
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit(): void {
    //choamre per vedere se e un gruppo butto forte
    this.isGroup = window.localStorage.getItem('isGroup') === 'true';
    this.messages = [];
    this.screenW = window.innerWidth;
    const params = this.route.snapshot.queryParams;
    //console.log(`Query params: ${JSON.stringify(params)}`); // Object {}
    this.userService.getUserInfo().then(data=>{
      //this.chatGateway.deleteAllChannels();
      this.whoami = data;
      this.initializeChat();
    });
  }

  onDropdownChange(event: any): void {
    this.selectedOption = event.target.value;
    //console.log('Selected option:', this.selectedOption);
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
              this.title = username;
              this.isOpen = true;
              this.chatGateway.receivePrivChannelMsg(username, undefined);
            },
            error:(err)=>{
              this.router.navigate(
                [], 
                {
                  relativeTo: this.activatedRoute,
                  queryParams: {},
                }
              );
              this.onUserNotFound();
            }
          })
          } else if (id !== undefined) {
            this.chatGateway.getInChannelByIdHttp(id, this.userService.getUser()).pipe(take(1)).subscribe({
              next:(data)=>{
                if (data === true) {
                  console.log(data);
                  this.chatGateway.receivePrivChannelMsg(undefined, id);
                  this.isOpen = true;
                }
                else {
                  this.router.navigate(
                    [], 
                    {
                      relativeTo: this.activatedRoute,
                      queryParams: {},
                    }
                  );
                  this.onUserNotFound();
                }
                }
            })
          }
          this.chatGateway.receiveUserChannels(this.userService.getUser());
        })
    );
    
    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (messages: any) => {
          this.messages = [...this.messages, ...messages.filter((message:any)=>{
            if (!this.selectedChannel){
              return message.members?.every((mem:string)=>mem === this.queryParams['username'] || mem === this.userService.getUser());
            }
            return (this.selectedChannel.id === message.channelId);
          })];
          this.chatGateway.sendLastSeen(this.selectedChannel.id, this.userService.getUser());
          this.chatGateway.getChannelById(this.selectedChannel.id);
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onUserChannelList().subscribe({
        next: (data: any) => {
          this.channels = [];
          const myUsername = this.userService.getUser();
          this.channels = data.channels.map((channel:any)=> {
            let isGroup = true;
            let allRead = false;
            if (channel.id == this.queryParams['id']){
              this.selectedChannel = channel;
            }
            if (!channel.name){
              isGroup = false;
              const otherUser = channel.members.find((m: any)=> m.user.username != myUsername);
              channel.name = otherUser.user.username;
            }
            for (let userList of channel.lastSeen) {
              if (userList === myUsername){
                allRead = true;
              }
            }
          return {...channel,
                  isGroup,
                  allRead};
          });
          this.chatGateway.getChannelById(this.selectedChannel.id);

          this.$subs.add(
            this.chatGateway.onReceiveMsgForChannel().subscribe({
              next: (messages: any) => {
                this.messages = messages;
                this.chatGateway.getChannelById(this.selectedChannel.id);
              },
              error: (error) => {
                this.errorMsg = `Error receiving message from channel: ${error.message}`;
              },
            }),
          );
        },
        error: (error) => {
          this.errorMsg = `Error receiving channel list`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onCreatedNewPublicChannel().subscribe({
        next: (data: any) => {
          if (data.members.some((member: any) => member.username === this.userService.getUser())) {
          this.channels.push(data);
          if (data.user === this.userService.getUser()){
            this.selectedChannel = data;
          }
        }
      }
      })
    );
  }

  sendMessageToChannel(): void {
    if (this.newMessage.trim()) {
      let id = this.queryParams['id'];
      if (this.selectedChannel)
      id = this.selectedChannel.id;
      if (this.isGroup) {
        if(this.chatGateway.getUserStatus(id, this.userService.getUserId()).pipe(take(1)).subscribe({
          next:(data)=> {
            console.log(data);
            const status = data.status;
            const muteTime = data.muteEndTime;
            if (status === 'KICKED') {
              this.msgToShow = "You are been kickd from this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return false;
            }
            if (status === 'BANNED') {
              this.msgToShow = "You are banned from this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return false;
            }
            if (muteTime > new Date().toISOString()) {
              const dateObject = new Date( muteTime);
              const hours = dateObject.getHours();
              const minutes = dateObject.getMinutes();
              const formattedTime = `${hours}:${minutes}`;
      
              this.msgToShow = "You are muted until " + formattedTime;
              setTimeout(()=> this.msgToShow = null, 2500);
              return false;
            }
            return true;
          }
        }))
        this.chatGateway.sendChannelMsg(this.newMessage, id);
      }
      else {
        this.chatGateway.sendChannelMsg(this.newMessage, id);
      }
    }
  }

  sendMessageToUser() {
    if (this.newMessage.trim()) {
      if (this.queryParams['username'])
        this.chatGateway.sendPrivMsg(this.newMessage, this.queryParams['username']);
      else if(this.queryParams['id']) {
        this.sendMessageToChannel();
        this.chatGateway.sendLastSeen(this.queryParams['id'], this.userService.getUser());
      }
      this.newMessage = ''; // Reset the input after sending
    }
  }

  ngOnDestroy(): void {
    this.$subs.unsubscribe();
  }

  async openChat(conversation: any) {
    if (this.queryParams['id'] === conversation.id) {
      return;
    }
    this.isGroup = conversation.isGroup;
    window.localStorage.setItem('isGroup', JSON.stringify(conversation.isGroup));
    conversation = conversation;
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
    this.chatGateway.sendLastSeen(conversation.id, this.userService.getUser());
    conversation.allRead = true;
  }


  async searchChat() {
    let user = null;
    if (this.search !== '' && this.search !== this.userService.getUser()) {
      const user = await this.userService.getUserByUsernamePromise(this.search);
      const dirChannel = await this.chatGateway.getDirectChatByNames(this.userService.getUser(), this.search);
      if (dirChannel) {
        this.chatGateway.getChannelById(dirChannel.id);
        this.router.navigate(
          [], 
          {
            relativeTo: this.activatedRoute,
            queryParams: {id:dirChannel.id},
          }
        );
        this.search = '';
        return;
      }
      if (user !== null) {
        this.chatGateway.sendPrivMsg("", this.search);
        const newChannel = await this.chatGateway.getDirectChatByNames(this.userService.getUser(), this.search);
        this.router.navigate(
          [], 
          {
            relativeTo: this.activatedRoute,
            queryParams: {id:newChannel.id},
          }
        );
        this.search = '';
        return;
      } else {
        this.placeholder = 'Chat not found';
        setTimeout(() => {
          this.placeholder = 'Search user or channel';
        }, 2000);
      }
      this.search = '';
    }
  }

  async leaveChannel() {
    const user = this.userService.getUser();
    this.chatGateway.sendModChannelMsg(`${user} LEFT the channel`, this.queryParams['id']);
    this.chatGateway.changeUserStatus(this.queryParams['id'], user, 'KICKED');
    console.log('LEAVE');
  }

  backClick() {
    this.isOpen = false;
    this.title = 'chat';
    console.log('TKM');
  }

}