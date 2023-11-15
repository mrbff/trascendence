import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserService } from 'src/app/core/services/user.service';
import { GameInfo } from 'src/app/game/components/pong/dto/gameInfo.dto';
import { SubscribeMessage } from '@nestjs/websockets';

@Injectable()
export class PongGateway {
  private socket: Socket;

  constructor(private readonly userData: UserService) {
    this.socket = io('/pong', {path: '/socket.io/', reconnection: true});
  }

  // Emit moveRacket event to the server
  moveRacket(direction: string) {
    this.socket.emit('moveRacket', { direction });
  }

  // Listen for game-update events from the server
  onGameUpdate(): Observable<GameInfo> {
    return new Observable((observer) => {
      this.socket.on('game-update', (data: GameInfo) => {
        observer.next(data);
      });
    });
  }

  onOpponentFound(): Observable<{ id: string; connected: boolean }> {
	return new Observable((observer) => {
		this.socket.on('opponent-found', (response: { id: string; connected: boolean }) => {
        observer.next(response);
		});
	});
  }

  disconnect(): void{
	this.socket.disconnect();
  }

  // Connect to the game if the opponent is connected
//   connectToGame(user: UserLoggedModel) {
//     this.checkOpponentConnection().subscribe((response) => {
//       if (response.connected) {
//         this.socket.emit('game-connect', user);
//       }
//     });
//   }
}
