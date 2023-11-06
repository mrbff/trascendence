import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
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
}
