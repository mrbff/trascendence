import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class RedirectionGateway {
  private socket;

  /*   TO DO     // Crea la connessione WebSocket con il token nell'URL
const socket = new WebSocket(`ws://example.com/socket?token=${jwtToken}`); */

  constructor() {
    this.socket = io('/redirection', { path: '/socket.io/' });
  }

  sendMessageRequest() {
    this.socket.emit('messageRequest', {});
  }

  onTextMessage() {
    return new Observable((observer) => {
      this.socket.on('textMessage', (data) => {
        observer.next(data.message);
      });
    });
  }
}
