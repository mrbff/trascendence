import { UserInfo } from '../../../models/userInfo.model';
import { START_RACKET_DATA } from './dto/racket.dto';
import { io } from 'socket.io-client';
import { gameInfo } from './dto/gameInfo.dto';
import {
  Component,
  HostListener,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { BlobOptions } from 'buffer';
import { START_BALL_DATA } from './dto/ball.dto';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css'],
})
export class PongComponent implements OnInit {
  game: gameInfo = {
    ball: START_BALL_DATA,
    player0: START_RACKET_DATA,
    player1: START_RACKET_DATA,
    score0: 0,
    score1: 0,
    p0Y: 40,
    p1Y: 40,
    p0X: 3,
    p1X: 100 - 3 - 3,
    ballX: -1 * 3,
    ballY: -1 * 4,
    canMoveBall: false,
    canMoveRackets: false,
    racket0Increment: 0,
    racket1Increment: 0,
  };
  private socket: any;
  opponentConnected = false;
  user!: UserInfo;

  public async ngOnInit() {
    this.user = await this.userData.getUserInfo();

    this.socket = io('https://localhost:8080');
    this.socket.on('update', (data: gameInfo) => {
      this.game = data;
    });
    setInterval(this.checkOpponentConnection, 5000);
  }

  constructor(private readonly userData: UserService) {}

  // Function to check opponent's connection
  checkOpponentConnection() {
    this.socket.emit('checkOpponent', (response: boolean) => {
      this.opponentConnected = response;
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: any) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
      this.socket.emit('moveRacket', { direction: 'up' });
    }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      this.socket.emit('moveRacket', { direction: 'down' });
    }
  }

  // @HostListener('window:keyup', ['$event'])
  // onKeyUp(e: any) {
  //   if (e.code === 'KeyW' || e.code === 'KeyS') {
  //   }
  //   if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
  //   }
  // }
}
