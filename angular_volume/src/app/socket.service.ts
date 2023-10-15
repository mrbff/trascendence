import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  sendMessageRequest() {
    this.socket.emit('messageRequest', {});
  }

  onTextMessage() {
    return new Observable(observer => {
      this.socket.on('textMessage', (data) => {
        observer.next(data.message);
      });
    });
  }
}