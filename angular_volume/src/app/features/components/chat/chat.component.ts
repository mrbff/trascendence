import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { UserInfo } from 'src/app/models/userInfo.model';
import { PasswordComponent } from './components/password/password.component';
import { LeaveChannelComponent } from './components/leave-channel/leave-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';

class Pending {
  status: boolean = false;
  sender: string = '';
  reciver: string = '';
  time: number = 0;
}

@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  allMembers: any;
  @ViewChild('messageArea') messageArea!: ElementRef;
  private $subs = new Subscription();
  private $msgSub = new Subscription();
  private $gameSub = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list
  public whoami!: UserInfo;
  public userLis!: UserInfo[];
  public userList: string[] = [];


  search: string;
  placeholder: string;
  isOpen: boolean;
  title: string;
  msgToShow: string | null = null;
  screenW: any;
  allRead: boolean;
  selectedOption: string | undefined;
  isGroup: boolean;
  isOwner: boolean;
  isPending: Pending [] = [];
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  queryParams: {[key:string]:string} = {}
  chat: any[];
  stickBottom = true;
  
  selectedChannel: any;
  isDefined: boolean;
  
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
    
  }
  constructor(
    private cdr: ChangeDetectorRef,
    readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute, 
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.messages = [];
    this.chat = [];
    this.search = '';
    this.placeholder = 'Search user or channel';
    this.isOpen = false;
    this.title = 'CHAT';
    this.allRead = false;
    this.isGroup = false;
    this.isOwner = false;
    this.isDefined = false;
  }

  ngAfterViewChecked(): void {
    if (this.isOpen && this.stickBottom) {
      this.scrollToBottom();
    }
    this.cdr.detectChanges();
    if (this.messageArea && !this.isDefined) {
      this.isDefined = true;
      setTimeout(()=> { 
        this.renderer.listen(this.messageArea.nativeElement, 'scroll', (event) => {
          this.stickBottom = ((this.messageArea.nativeElement.scrollHeight - this.messageArea.nativeElement.scrollTop) == this.messageArea.nativeElement.clientHeight);
        });
      }, 1000);
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
    window.onbeforeunload = () => this.ngOnDestroy();
    this.userService.patchNumberOfConnections('+');
    const idsLocal = this.activatedRoute.snapshot.queryParams['id'];
    if (idsLocal == window.localStorage.getItem('idConv')?.replace(/\"/g, '')) {
      this.isGroup = window.localStorage.getItem('isGroup') === 'true';
      this.isOwner = window.localStorage.getItem('isOwner') === 'true';
    }
    this.messages = [];
    this.screenW = window.innerWidth;
    this.userService.getUserInfo().then(data=>{
      this.whoami = data;
      this.initializeChat();
    });
  }

  createPending() {
    this.chatGateway.getMessagesPenidng(null).pipe(take(1)).subscribe({
      next:(data)=>{
        this.isPending = [];
        data.forEach((p: any) => {
          this.isPending.push({status: true, sender: p.sender.username, reciver: p.content.split(":")[0] , time: p.time});
        });
      }
    });
  }

  onDropdownChange(event: any): void {
    this.selectedOption = event.target.value;
  }

  private onUserNotFound() {}

  initializeChat() : void {
    this.$subs.add(
      interval(1000).subscribe(() => {
        this.createPending();
      })
    );

    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        this.queryParams = params;
        const id = params['id'];
        const username = params['username'];
        if (id === undefined && username === undefined) {
          this.isGroup = false;
          this.isOwner = false;
        }
        if (username !== undefined) {
          this.userService.getUserByUsername(username).pipe(take(1)).subscribe({
            next:async (user)=>{
              const ch = await this.chatGateway.getChatOrCreate(this.userService.getUser(), username, "DIRECT");
              this.selectedChannel = ch;
              const id = ch.id;
              this.chatGateway.receiveChannelMsg(id);
              this.isOpen = true;
              if (ch.allRead == false) {
                this.chatGateway.sendLastSeen(id, this.userService.getUser());
              }
              this.allRead = true;
              this.router.navigate(
                [], 
                {
                  relativeTo: this.activatedRoute,
                  queryParams: { id: id },
                }
              );
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
          this.$subs.add(
            this.chatGateway.getInChannelById(id, this.userService.getUser()).subscribe({
              next:(data)=>{
                const {result} = data;
                if (result === true) {
                  this.chatGateway.receiveChannelMsg(id);
                  this.isOpen = true;
                } else {
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
            })
          );
        }
        this.chatGateway.receiveUserChannels(this.userService.getUser());
      })
    );

    if(this.$gameSub) {
      this.chatGateway.onGameAccepted().subscribe({
        next: (data: any) => {
          this.chatGateway.getUser(this.whoami.username).subscribe({
            next: (user: UserInfo) => {
              //console.log('user', user);
              if (!user.isPlaying) {
                let snackBarRef = this.snackBar.open(data.enemy + ' ha accettato il tuo game invite, vuoi joinare?', 'Join', {
                  duration: 5000,
                });
        
                snackBarRef.onAction().subscribe(() => {
                  this.router.navigate(['/transcendence/pong'], { queryParams: { invited: data.id, mode: data.mode } });
                });
              }
            }
          });
        }
      });
    }

    if (this.$msgSub) {
      this.$msgSub = (
        this.chatGateway.onMsgFromChannel().subscribe({
          next: (messages: any) => {
            const isListed = this.channels.find((channel: any) => channel.id === messages[0].channelId) !== undefined;
            if (isListed) {
              this.channels = this.channels.map((channel: any) => {
                if (channel.id === messages[0].channelId && channel.id !== this.queryParams['id']) {
                  channel.allRead = false;
                } else {
                  channel.allRead = true;
                }
                return channel;
              });
            }

            if (!isListed) {
              this.chatGateway.getChannelByIds(messages[0].channelId).pipe(take(1)).subscribe({
                next:(data)=>{
                  data.name = data.name ?? data.members.find((m: any)=> m.user.username != this.userService.getUser()).user.username;
                  data = {...data, isGroup: false, allRead: messages[0].channelId !== this.queryParams['id'] ? false : true};
                  this.channels.push(data);
                }
              });
            }

            this.chatGateway.getUserList(messages[0].channelId).pipe(take(1)).subscribe({
              next:(data) => {
                if (data.usernames === undefined) {
                  return
                }
                data.usernames.forEach((username: string, i: number) => {
                  if (username === this.userService.getUser() && data.status[i] !== 'BANNED' && username !== messages[0].user) {
                    if ((this.selectedChannel === undefined || this.selectedChannel.id !== messages[0].channelId)) {
                      let mess; 
                      if (messages[0].isInvite === 'PENDING') {
                        mess = `${messages[0].user} invite you to play a game`;
                      } else {
                        mess = `new message from ${messages[0].user} \n ${messages[0].msg.slice(0,60)}`;
                      }
                      this.snackBar.open(mess, 'Close', {
                        duration: 3100,
                        panelClass: ['multiline-snackbar'],
                        verticalPosition: "top",
                        horizontalPosition: "right",
                      });
                    }
                  }
                });
              }
            });

              this.messages = [...this.messages, ...messages.filter((message:any)=> {
                if (!this.selectedChannel) {
                  return message.members?.every((mem:string)=>mem === this.queryParams['username'] || mem === this.userService.getUser());
                }
                return (this.selectedChannel.id === message.channelId);
              })];

            if (this.selectedChannel !== undefined) {
              if(this.selectedChannel.id === messages[0].channelId) {
                //console.log(messages);
                if ((messages[0].msg.includes('has been BANNED from the channel by') ||
                  messages[0].msg.includes('has been KICKED from the channel by') ||
                  messages[0].msg.includes('LEFT the channel')) &&
                  messages[0].msg.includes(this.userService.getUser())) {
                  this.chatGateway.receiveUserChannels(this.userService.getUser());
                }
                this.chatGateway.sendLastSeen(this.selectedChannel.id, this.userService.getUser());
                this.chatGateway.getChannelById(this.selectedChannel.id);
                this.stickBottom = true;
              }
            }
          },
          error: (error) => {
            this.errorMsg = `Error receiving message from channel: ${error.message}`;
          },
        })
      );
    }

    this.$subs.add(
      this.chatGateway.onUserChannelList().subscribe({
        next: (data: any) => {
          const myUsername = this.userService.getUser();
          this.channels = data.channels.map((channel:any)=> {
            let isGroup = true;
            let allRead = false;
            if (channel.id == this.queryParams['id']) {
              this.selectedChannel = channel;
            }
            if (!channel.name) {
              isGroup = false;
              const otherUser = channel.members.find((m: any)=> m.user.username != myUsername);
              channel.name = otherUser.user.username;
            }
            for (let userList of channel.lastSeen) {
              if (userList === myUsername){
                allRead = true;
              }
            }
            if ((channel.messages.length as number) === 0) {
              allRead = true;
            }
            return {...channel,
                    isGroup,
                    allRead};
            })?.sort((c1: any, c2: any)=>c1.name?.localeCompare(c2?.name ?? "") ?? 0);
          this.channels.forEach((channel: any) => {
            if (!channel.isGroup) {
              if((channel.messages.length as number) === 0) {
                this.channels = this.channels.filter((c: any) => c.id !== channel.id);
              }
            }
          });

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
          //console.log(data);
          if (data.members.some((member: any) => member.user.username === this.userService.getUser())) {
            this.channels.push(data);
            if (data.user === this.userService.getUser()) {
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
          this.chatGateway.getTypesOfRealation(id, this.whoami.username).pipe(take(1)).subscribe({
            next:(data)=>{
              //console.log(data);
              if (data.type === 'BLOCKED'){
                this.msgToShow = "You are blocked by this user you can't send a message to him";
                setTimeout(()=> this.msgToShow = null, 2500);
                return
              } else if (data.type === 'BLOCKING'){
                this.msgToShow = "You are blocking this user unlock him to send a message";
                setTimeout(()=> this.msgToShow = null, 2500);
                return
              } else if (data.type === 'BANNED') {
                this.msgToShow = "You are banned from this channel";
                setTimeout(()=> this.msgToShow = null, 2500);
                return
              } else {
              const status = data.status;
              const muteTime = data.muteEndTime;
              //console.log("mute time", muteTime);
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
                const dateObject = new Date(muteTime);
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
            }
          });
        }
      });
    }
  }

  sendMessageToUser() {
    if (this.newMessage.trim()) {
      if(this.queryParams['id']) {
        this.sendMessageToChannel();
        this.chatGateway.sendLastSeen(this.queryParams['id'], this.userService.getUser());
      }
      this.newMessage = ''; 
    }
  }

  ngOnDestroy(): void {
    this.userService.patchNumberOfConnections('-');
    this.selectedChannel = undefined;
    this.$subs.unsubscribe();
  }

  async openChat(conversation: any) {
    if (this.queryParams['id'] === conversation.id) {
      return;
    }
    this.isGroup = conversation.isGroup;
    window.localStorage.setItem('isGroup', JSON.stringify(conversation.isGroup));
    window.localStorage.setItem('idConv', JSON.stringify(conversation.id));
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
    this.selectedChannel.members.find((m: any)=> m.user.username === this.userService.getUser()).role === 'OWNER' ? this.isOwner = true : this.isOwner = false;
    window.localStorage.setItem('isOwner', JSON.stringify(this.isOwner));
    this.msgToShow = null;
    this.allRead = conversation.allRead;
    this.allMembers = conversation.members;
    if (this.allRead === false) {
      this.chatGateway.sendLastSeen(conversation.id, this.userService.getUser());
    }
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
        this.chatGateway.getUserList(publicChannel.id).pipe(take(1)).subscribe({
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
        const newChannel = await this.chatGateway.getChatOrCreate(username, this.search, "DIRECT");
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
      data: { channelName: this.selectedChannel.name },
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
              this.chatGateway.getUserList(this.queryParams['id']).pipe(take(1)).subscribe({
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

  setList($event: any) {
    this.userList = $event;
  }
  backClick() {
    this.isOpen = false;
  }

}
