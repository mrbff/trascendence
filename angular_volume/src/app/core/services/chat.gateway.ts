import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatGateway {
  private socket;

  constructor() {
    this.socket = io('/chat', { path: '/socket.io/' });
  }

  sendChannelMsg(message:string) {
    this.socket.emit('ChannelMsg', {sender:'', channel:'', message:message });
  }

  sendPrivMsg(message:string) {
    this.socket.emit('PrivMsg', { sender:'', receiver:'', message:message });
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(data.message);
      });
    });
  }

  onMsgFromPriv() {
    return new Observable((observer) => {
      this.socket.on('MsgFromPriv', (data) => {
        observer.next(data.message);
      });
    });
  }


}
