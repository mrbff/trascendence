import { UserInfo } from '../../../models/userInfo.model';
import { GameInfo, START_GAME_DATA } from './dto/gameInfo.dto';
import { Component, HostListener, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { PongGateway } from 'src/app/core/services/game.gateway';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css'],
  providers: [PongGateway],
})
export class PongComponent implements OnInit , OnDestroy{
	
	game: GameInfo = START_GAME_DATA;
	private socket: any;
	user!: UserInfo;
	opponentConnected = false;
	
	constructor(
		private readonly userData: UserService,
		private readonly gate: PongGateway,
	//	private subs: Subscription
		){}

	public async  ngOnInit() {
		this.user = await this.userData.getUserInfo();
		this.game.player.player = this.user.id;
		this.gate.onGameUpdate().subscribe((data) => {
			console.log(data);
			this.game = data;
		});
		
		this.gate.onOpponentFound().subscribe((found) =>{
			console.log('opponent found starting game');
			this.game.opponent.player = found.id;
			this.opponentConnected = found.connected;
		});
	}

	ngOnDestroy(): void {
		// clearInterval(this.findOpponent);
		this.gate.disconnect();
	}

	startGame(): void{
	}

	@HostListener('window:keydown', ['$event'])
	onKeyDown(e: any) {
		if (e.code === 'KeyW' || e.code === 'ArrowUp') {
			this.gate.moveRacket('up');
		}
		if (e.code === 'KeyS' || e.code === 'ArrowDown') {
			this.gate.moveRacket('down');
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
