import { UserInfo } from '../../../models/userInfo.model';
import { Component, HostListener, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, AfterContentChecked, AfterViewChecked, NgZone } from '@angular/core';
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
	racket: number = -1;
	private scene!: BABYLON.Scene;
	
	constructor(
		private readonly userData: UserService,
		private readonly gate: PongGateway,
		private ngZone: NgZone,
	){}
	
	public async  ngOnInit() {
		this.user = await this.userData.getUserInfo();
		// this.gate.onPlayerUpdate().subscribe((data) => {
		// 	//console.log(data);
		// });
		this.gate.onPlayerUpdate();
		this.gate.onOpponentFound().subscribe((found) =>{
			console.log('opponent found starting game');
			this.opponentConnected = found.connected;
			this.racket = found.seat;
		});
	}

	ngAfterViewChecked(): void {
		// Check if opponent is connected and canvas is available
		if (this.opponentConnected) {
			this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
			if (this.canvas && !this.scene) {
				this.scene = this.gate.start(this.canvas);
				console.log(this.scene);
			} else {
				//console.error('Canvas element not found.');
			}
		}
	}

	ngOnDestroy(): void {
		// if (this.scene)
			// this.gate.stop();
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
}
