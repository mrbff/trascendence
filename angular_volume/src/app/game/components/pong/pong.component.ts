import { UserInfo } from '../../../models/userInfo.model';
import { Component, HostListener, OnInit, ViewChild, OnDestroy, AfterViewChecked } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { PongGateway } from 'src/app/core/services/game.gateway';
import * as BABYLON from '@babylonjs/core';
import { ActivatedRoute } from '@angular/router';

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
	scene!: BABYLON.Scene;
	gameMode: string = "";

	
	constructor(
		private readonly userData: UserService,
		private readonly gate: PongGateway,
		private route: ActivatedRoute,
	){}
	
	public async  ngOnInit() {
		this.user = await this.userData.getUserInfo();

	this.route.queryParams.subscribe((params) => {
		//console.log(params);
		if (params['invited']) {
			this.gameMode = params['gameMode'];
			this.start(); 
		}
		});
	}

	
	ngAfterViewChecked(): void {
		// Check if opponent is connected and canvas is available
		if (this.opponentConnected) {
			this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
			if (this.canvas && !this.scene) {
				this.scene = this.gate.start(this.canvas);
			}
		}
	}
	
	ngOnDestroy(): void {
		if (this.starting)
			this.gate.disconnect();
	}
	
	start() {
		this.starting = true;
		this.gate.connect(this.gameMode, this.user);
		this.gate.onOpponentFound().subscribe((found) =>{
			console.log('opponent found starting game');
			this.opponentConnected = true;
			});
		this.gate.onGameFinish().subscribe((data: {won: boolean, matchId: number}) =>{
			console.log(`game finished\nwon: ${data.won}`);
			if (data.won)
				this.userData.updateWinnLoss(this.user.id, {res: 'Won', matchId: data.matchId});
			else	
				this.userData.updateWinnLoss(this.user.id, {res: 'Lost', matchId: data.matchId});
		})
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
