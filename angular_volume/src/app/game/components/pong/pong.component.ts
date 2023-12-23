import { UserInfo } from '../../../models/userInfo.model';
import { Component, HostListener, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { PongGateway } from 'src/app/core/services/game.gateway';
import * as BABYLON from '@babylonjs/core';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css'],
  providers: [PongGateway],
})
export class PongComponent implements OnInit , OnDestroy, AfterViewChecked{
	@ViewChild('renderCanvas', {static: true})
	canvas!: HTMLCanvasElement;
	
	user!: UserInfo;
	opponentConnected = false;
	starting = false;
	racket: number = -1;
	scene!: BABYLON.Scene;
	gameMode: string = "";

	
	constructor(
		private readonly userData: UserService,
		private readonly gate: PongGateway,
	){}
	
	public async  ngOnInit() {
		this.user = await this.userData.getUserInfo();
		// this.gate.onPlayerUpdate().subscribe((data) => {
		// 	//console.log(data);
		// });

	}

	
	ngAfterViewChecked(): void {
		// Check if opponent is connected and canvas is available
		if (this.opponentConnected) {
			this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
			if (this.canvas && !this.scene) {
				this.scene = this.gate.start(this.canvas);
				// console.log(this.scene);
			}
		}
	}
	
	ngOnDestroy(): void {
		// if (this.scene)
		// this.gate.stop();
		if (this.starting)
			this.gate.disconnect();
	}
	
	start() {
		this.starting = true;
		this.gate.connect(this.gameMode);
		this.gate.onOpponentFound().subscribe((found) =>{
			console.log('opponent found starting game');
			this.opponentConnected = found.connected;
			this.racket = found.seat;
		});
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

	onChangeSelection(event: Event) {
		this.gameMode = (event.target as HTMLInputElement).value;
	}
}
