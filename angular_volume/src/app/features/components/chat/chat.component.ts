import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/models/userInfo.model';
import { PasswordComponent } from './components/password/password.component';
import { LeaveChannelComponent } from './components/leave-channel/leave-channel.component';
import { MatDialog } from '@angular/material/dialog';



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
    private dialog: MatDialog,
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
    this.isGroup = window.localStorage.getItem('isGroup') === 'true';
    this.messages = [];
    this.screenW = window.innerWidth;
    const params = this.route.snapshot.queryParams;
    this.userService.getUserInfo().then(data=>{
      this.whoami = data;
      this.initializeChat();
    });
  }

  onDropdownChange(event: any): void {
    this.selectedOption = event.target.value;
  }

  private onUserNotFound(){
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
          this.$subs.add(this.chatGateway.getInChannelByIdHttp(id, this.userService.getUser()).subscribe({
            next:(data)=>{
              const {result} = data;
              if (result === true) {
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
              },
          }));
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
          if (this.selectedChannel !== undefined){
            this.chatGateway.sendLastSeen(this.selectedChannel.id, this.userService.getUser());
          }
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
          })?.sort((c1: any, c2: any)=>c1.name?.localeCompare(c2?.name ?? "") ?? 0);
          if (this.selectedChannel !== undefined){
            this.chatGateway.getChannelById(this.selectedChannel.id);
          }
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
      const msg = this.newMessage; // Save the message perche altrimenti sparisce nel nulla
      this.chatGateway.getUserStatus(id, this.userService.getUserId()).pipe(take(1)).subscribe({
          next:(data)=> {
            if (!data){
              this.msgToShow = "You are no more in this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            const status = data.status;
            const muteTime = data.muteEndTime;
            if (status === 'LEAVED') {
              this.msgToShow = "You leaved this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            if (status === 'KICKED') {
              this.msgToShow = "You are been kickd from this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            if (status === 'BANNED') {
              this.msgToShow = "You are banned from this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            if (muteTime > new Date().toISOString()) {
              const dateObject = new Date( muteTime);
              const hours = dateObject.getHours();
              const minutes = dateObject.getMinutes();
              const formattedTime = `${hours}:${minutes}`;
      
              this.msgToShow = "You are muted until " + formattedTime;
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            this.chatGateway.sendChannelMsg(msg, id);
            return
          }
        });
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
    const username = this.userService.getUser();
    if (this.search !== '' && this.search !== username) {
      const dirChannel = await this.chatGateway.getChatByNames(username, this.search, "DIRECT");
      if (dirChannel) {
        this.isGroup = false;
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
      const publicChannel = await this.chatGateway.getChatByNames(username, this.search, "PUBLIC");
      if (publicChannel) {
        this.chatGateway.getUserListById(publicChannel.id).pipe(take(1)).subscribe({
          next:(data)=>{
            if (!data.usernames.includes(username)){
              if (publicChannel.password !== null && publicChannel.password !== "") {
                const dialogRef = this.dialog.open(PasswordComponent, {
                  data: { password: '' }
                });
                dialogRef.afterClosed().subscribe((password: string) => {
                  if (password && password === publicChannel.password) {
                    this.chatGateway.addUserToChannel(publicChannel.id, username);
                    this.chatGateway.sendModChannelMsg(`${username} JOINED the channel`, publicChannel.id, username, 'ACTIVE');
                  }
                  else if (password && password !== publicChannel.password) {
                    this.msgToShow = "Wrong password please try again.";
                    setTimeout(()=> this.msgToShow = null, 2500);
                  }
                  else if (!password) {
                    return;
                  }
                });
              } else {
                this.chatGateway.addUserToChannel(publicChannel.id, username);
                this.chatGateway.sendModChannelMsg(`${username} JOINED the channel`, publicChannel.id, username, 'ACTIVE');
              } 
            }
            if (data.usernames.includes(username) && data.status[data.usernames.indexOf(username)] === 'BANNED'){
              this.msgToShow = "You are banned from this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return;
            }
            this.router.navigate(
                [], 
              {
                relativeTo: this.activatedRoute,
                queryParams: {id:publicChannel.id},
              }
            );
              this.search = '';
              return;
          }
        });
        return;
      }
      const user = await this.userService.getUserByUsernamePromise(this.search);
      if (user !== null) {
        this.isGroup = false;
        this.chatGateway.sendPrivMsg("", this.search);
        const newChannel = await this.chatGateway.getChatByNames(username, this.search, "DIRECT");
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
    const dialogRef = this.dialog.open(LeaveChannelComponent, {
      data: { status : Boolean }
    });
    dialogRef.afterClosed().subscribe((status: boolean) => {
      if (status) {
        const userId = this.userService.getUserId();
        const user = this.userService.getUser(); 
        this.chatGateway.getUserStatus(this.queryParams['id'], userId).pipe(take(1)).subscribe({
          next:(data)=> {
            if (!data){
              this.msgToShow = "You are no more in this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return;
            }
            const status = data.status;
            const userRole = data.role;
            if (status === 'LEAVED') {
              this.msgToShow = "You leaved this channel";
              setTimeout(()=> this.msgToShow = null, 2500);
              return
            }
            this.chatGateway.sendModChannelMsg(`${user} LEFT the channel`, this.queryParams['id'], user, 'LEAVED');
            if (userRole === 'OWNER') {
              this.chatGateway.getUserListById(this.queryParams['id']).pipe(take(1)).subscribe({
                next:(data)=>{
                  const index = data.usernames.findIndex((username:string, i:number) => {
                    return data.status[i] === 'ACTIVE' && username !== user;
                  });
                  if (index !== -1) {
                    this.chatGateway.setOwner(this.queryParams['id'], data.usernames[index]);
                    this.chatGateway.sendModChannelMsg(`${data.usernames[index]} is now the OWNER`, this.queryParams['id'], data.usernames[index], 'ACTIVE');
                  }
                }
              });
            }
          }
        });
      }
    });
  }

  backClick() {
    this.isOpen = false;
    this.title = 'chat';
    console.log('TKM');
  }

}