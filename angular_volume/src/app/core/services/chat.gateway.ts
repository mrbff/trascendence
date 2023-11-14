import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatGateway {
  private socket;

  constructor(
    private authService:AuthService,
    private readonly userService:UserService
    ) {
    const jwt = this.authService.getToken();
    console.log({jwt});
    
    this.socket = io('/chat', { 
      path: '/socket.io/',
      auth:{token: jwt}
    });
  }

  sendChannelMsg(message:string) {
    this.socket.emit('ChannelMsg', { sender:this.userService.getUser(), channel:'', message:message });
  }

  sendPrivMsg(message:string) {
    this.socket.emit('PrivMsg', { sender:this.userService.getUser(), receiver:'', message:message });
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(
          {
            msg:data.message,
            user:data.sender
          }
        );
      });
    });
  }

  onMsgFromPriv() {
    return new Observable((observer) => {
      this.socket.on('MsgFromPriv', (data) => {
        observer.next(
          {
            msg:data.message,
            user:data.sender
          }
        );
      });
    });
  }

}
