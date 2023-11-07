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

  sendBroadcastChannel() {
    this.socket.emit('BroadcastChannel', {});
  }

  sendBroadcastUsers() {
    this.socket.emit('BroadcastUsers', {});
  }

  sendPrivMsg() {
    this.socket.emit('PrivMsg', {});
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(data.message);
      });
    });
  }

}
