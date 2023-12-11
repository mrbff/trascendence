import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserService } from 'src/app/core/services/user.service';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as GUI from '@babylonjs/gui';
import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class PongGateway {

	private socket: Socket;
	private engine!: BABYLON.Engine;
	private scene!: BABYLON.Scene;
	private camera!: BABYLON.ArcRotateCamera;
	private HUD!: GUI.AdvancedDynamicTexture
	private player = -1;

	constructor(private readonly userData: UserService, private ngZone: NgZone,) {
		this.socket = io('/pong', {path: '/socket.io/', reconnection: true, reconnectionDelay: 45000, timeout: 50000});
		this.socket.on('disconnect', function (reason) {
		console.log('Socket disconnected because of ' + reason);
		});
	}

	onOpponentFound(): Observable<{ client: string ; connected: boolean; seat: number}> {
		return new Observable((observer) => {
			this.socket.on('opponent-found', (response: { client: string; connected: boolean; seat: number}) => {
				this.player = response.seat;
				observer.next(response);
			});
		});
	}
	
	disconnect(): void{
		if (this.scene)
			this.stop();
		this.socket.disconnect();
	}


	//---------------------- SCENE -------------------------//



	start(canvas: HTMLCanvasElement): BABYLON.Scene {
		this.onScoreUpdate();
		this.onPlayerUpdate();
		this.ballHandler();
		this.onGameFinish();
		this.ngZone.runOutsideAngular(() => {
			this.initializeEngine(canvas);
			this.createScene(canvas);
			this.scene.executeWhenReady(() => this.renderScene());
			// Inspector.Show(this.scene, {});
		});
		return(this.scene);
	}
	
	initializeEngine(canvas: HTMLCanvasElement): void {
		this.engine = new BABYLON.Engine(canvas, true);
	}

	createScene(canvas: HTMLCanvasElement){
		if (this.scene) {
			this.scene.dispose();
		}
		this.engine.displayLoadingUI();
		this.scene = new BABYLON.Scene(this.engine);
		this.HUD = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", undefined, this.scene, undefined, true);
		this.scene.collisionsEnabled = true;

		var rectangle1 = new GUI.Rectangle("rect1");
		rectangle1.background = "black";
		rectangle1.color = "yellow";
		rectangle1.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		rectangle1.left = -200;
		rectangle1.width = "200px";
		rectangle1.height = "100px";
		rectangle1.cornerRadius = 20;
		this.HUD.addControl(rectangle1);
	
		var name1 = new GUI.TextBlock("name1");
		name1.fontFamily = "Helvetica";
		name1.text = "Player 1";
		name1.top = -20;
		name1.color = "orange";
		name1.fontSize = "14px";
		rectangle1.addControl(name1);
		var score1 = new GUI.TextBlock("score1");
		score1.fontFamily = "Helvetica";
		score1.text = '0';
		score1.top = 10;
		score1.color = "orange";
		score1.fontSize = "14px";
		rectangle1.addControl(score1);

		var rectangle2 = new GUI.Rectangle("rect2");
		rectangle2.background = "black";
		rectangle2.color = "yellow";
		rectangle2.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
		rectangle2.left = 200;
		rectangle2.width = "200px";
		rectangle2.height = "100px";
		rectangle2.cornerRadius = 20;
		this.HUD.addControl(rectangle2);
	
		var name2 = new GUI.TextBlock("name2");
		name2.fontFamily = "Helvetica";
		name2.top = -20;
		name2.text = "Player 2";
		name2.color = "orange";
		name2.fontSize = "14px";
		rectangle2.addControl(name2);

		var score2 = new GUI.TextBlock("score2");
		score2.fontFamily = "Helvetica";
		score2.text = '0';
		score2.top = 10;
		score2.color = "orange";
		score2.fontSize = "14px";
		rectangle2.addControl(score2);

		var victoryScreen = new GUI.Rectangle("victory");
		victoryScreen.background = "black";
		victoryScreen.color = "yellow";
		victoryScreen.width = "200px";
		victoryScreen.height = "100px";
		victoryScreen.isVisible = false;
		victoryScreen.cornerRadius = 20;
		this.HUD.addControl(victoryScreen);

		var victoryText = new GUI.TextBlock("victoryText");
		victoryText.fontFamily = "Azonic";
		victoryText.top = -20;
		victoryText.color = "orange";
		victoryText.fontSize = "20px";
		victoryScreen.addControl(victoryText);

		var exitBtn = GUI.Button.CreateSimpleButton("exit", "EXIT");
		exitBtn.width = "100px";
		exitBtn.height = "50px";
		exitBtn.fontFamily = "Azonic";
		exitBtn.top = 20;
		exitBtn.color = "orange";
		exitBtn.fontSize = "20px";
		exitBtn.onPointerUpObservable.add( () =>{
			window.location.href = '/trascendence/home';
		});
		victoryScreen.addControl(exitBtn);


		//this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
		this.camera = new BABYLON.ArcRotateCamera('camera', 0, 0.5, 50, BABYLON.Vector3.Zero(), this.scene);
		// This targets the camera to.scene origin
		this.camera.setTarget(BABYLON.Vector3.Zero());
		// This attaches the camera to the canvas
		this.camera.attachControl(canvas, true);
	
		var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.35, 1, -1), this.scene);
		light.intensity = 1;
		light.diffuse = new BABYLON.Color3(0.82, 0.46, 0.97);
		light.specular = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.2, 0.03, 0.22);
 		var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
		var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{height: 7, radius: 0.5});
		var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{height: 7, radius: 0.5});
		racket1.position = new BABYLON.Vector3(0, 4.5, -29);
		racket1.rotation = new BABYLON.Vector3(0, 0 , 1.57);
		racket1.ellipsoid.x = 4;
		racket2.position = new BABYLON.Vector3(0, 4.5, 29);
		racket2.rotation = new BABYLON.Vector3(0, 0 , 1.57);
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		racket2.ellipsoid.x = 4;
		BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", this.scene, (meshes)=> {
			meshes[1].name = 'board';
			meshes[1].checkCollisions = true;
		});
		//-------------- NEBULA SKYBOX -----------------
		// var nebula = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", this.scene);
        // nebula.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		var nebula = new BABYLON.CubeTexture("../../assets/skybox/sky", this.scene, null, true);
		this.scene.createDefaultSkybox(nebula, true, 1000);
		const music = new BABYLON.Sound('backgroun-music', "../../assets/Intergalactic Odyssey.ogg", this.scene, null, {loop:true, autoplay:true});
	}
	
	renderScene(): void{
		this.engine.hideLoadingUI();
		this.socket.emit('start');
		this.engine.runRenderLoop(()=> {
			this.scene.render();
		});
	}
	
	stop(): void {
		this.scene.dispose();
		this.engine.stopRenderLoop();
		this.engine.dispose();
		this.camera.dispose();
	}



	//---------------------- EVENT HANDLERS -------------------------//


	ballHandler(){
		this.socket.on('ball-update', (move: BABYLON.Vector3) =>{
			var ball = this.scene.getMeshByName('ball');
			if (ball){
				ball.position.addInPlace(move);
			}
		})
	}
	
	// Function to update the position of the racket
	moveRacket(direction: string): void {
		var racket = this.scene.getMeshByName(this.player === 1 ? 'player1': 'player2');
		if (racket) {
			switch (direction) {
				case 'up':
					racket.moveWithCollisions( new BABYLON.Vector3(-0.1, 0 , 0));
					break;
				case 'down':
					racket.moveWithCollisions( new BABYLON.Vector3(0.1, 0 , 0));
					break;
			}
		}
		this.socket.emit('moveRacket', direction);
	}

	// Listen for data-update events from the server
	onPlayerUpdate() {
		this.socket.on('racket-update', (dir: string) => {
			var racketOpp = this.scene.getMeshByName(this.player === 1 ? 'player2': 'player1');
			// console.log(dir);
			if (racketOpp) {
				switch (dir) {
					case 'up':
                        racketOpp.moveWithCollisions( new BABYLON.Vector3(-0.1, 0 , 0));
						break;
					case 'down':
                        racketOpp.moveWithCollisions( new BABYLON.Vector3(0.1, 0 , 0));
						break;
					}
				// console.log(racketOpp.position.x);
			}
		});
		this.socket.on('player-update', () =>{

		});
	}
	
	onScoreUpdate(){
		this.socket.on('score-update', (info: {score1: number, score2: number})=> {
			console.log("score updated");
			var ball = this.scene.getMeshByName('ball')!;
			ball.position = new BABYLON.Vector3(0, 4.5, 0);
			let score1 = this.HUD.getControlByName('score1') as GUI.TextBlock;
			let score2 = this.HUD.getControlByName('score2') as GUI.TextBlock;
			score1.text = info.score1.toString();
			score2.text = info.score2.toString();
		})
	}

	onGameFinish() {
		this.socket.on('finished', (winner: number) => {
			let victoryText = this.HUD.getControlByName('victoryText') as GUI.TextBlock;
			victoryText.text = 'Player ' + winner + ' won !';
			var victoryScreen = this.HUD.getControlByName('victory')!;
			victoryScreen.isVisible = true;
		})
	}	
	
}
