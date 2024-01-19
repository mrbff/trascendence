import { channel } from 'diagnostics_channel';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { UserService } from './user.service';
import { ElementSchemaRegistry } from '@angular/compiler';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root',
})
export class ChatGateway {
  private socket;

  constructor(
    private authService:AuthService,
    private readonly userService:UserService
    ) {
    
    //console.log('ChatGateway constructor called');
    const jwt = this.authService.getToken();
    //console.log({ jwt });
    
    this.socket = io('/chat', { 
      path: '/socket.io/',
      auth:{token: jwt}
    });
  }

  sendLastSeen(id: string, user: string) {
    this.socket.emit('LastSeen', { channelId: id, user: user });
  }

  sendChannelMsg(message:string, channel:string) {
    this.socket.emit('ChannelMsg', { sender:this.userService.getUser(), channel:channel, message:message });
  }

  createNewChannel(channelName:string, users:string[], creator:string, groupType:string, password:string) {
    this.socket.emit('CreateNewChannel', { channelName:channelName, users:users, creator:creator, groupType:groupType, password:password});
  }

  onCreatedNewPublicChannel() {
    return new Observable((observer) => {
      this.socket.on('CreatedNewPublicChannel', (data) => {
        observer.next(
          data.channel,
        );
      });
    });
  }

  sendPrivMsg(message:string, receiver:string) {
    this.socket.emit('PrivMsg', { sender:this.userService.getUser(), receiver:receiver, message:message });
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }
  onReceiveMsgForChannel() {
    return new Observable((observer) => {
      this.socket.on('ReceiveMsgForChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }
  receivePrivChannelMsg(receiver?:string, id?:string){
    if (receiver)
      this.socket.emit('ReceivePrivMsg', { sender:this.userService.getUser(), receiver:receiver });
    else if (id)
      this.socket.emit('ReceiveChMsg', { id });
  }

  reciveUserList(id:string){
    this.socket.emit('ReceiveUserList', { id });
  }

  receiveUserChannels(username:string){
    this.socket.emit('ReceiveUserChannels', { username });
  }

  onUserList(){
    return new Observable((observer) => {
      this.socket.on('UserList', (data) => {
        observer.next(data);
        console.log('onUserList', data);
      });
    });
  }

  onUserChannelList(){
    return new Observable((observer) => {
      this.socket.on('UserChannelList', (data) => {
        observer.next(data);
      });
    });
  }

  onUserInfos(){
    return new Observable((observer) => {
      this.socket.on('UserInfos', (data) => {
        observer.next(data);
      });
    });
  }
}
