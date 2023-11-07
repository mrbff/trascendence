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

  chatBroadcastChannel() {
    this.socket.emit('BroadcastChannel', {});
  }

  chatBroadcastUsers() {
    this.socket.emit('BroadcastUsers', {});
  }

  chatPrivMsg() {
    this.socket.emit('PrivMsg', {});
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('msgFromChannel', (data) => {
        observer.next(data.message);
      });
    });
  }

}