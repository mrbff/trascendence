import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserService } from 'src/app/core/services/user.service';
import { GameInfo } from 'src/app/game/components/pong/dto/gameInfo.dto';
import * as BABYLON from '@babylonjs/core';
// import "@babylonjs/loaders/glTF";

@Injectable()
export class PongGateway {

  private socket: Socket;
  private canvas!: HTMLCanvasElement;
  private engine!: BABYLON.Engine;
  private scene!: BABYLON.Scene;
  private camera!: BABYLON.ArcRotateCamera;
  private player: number = -1;
  
  constructor(private readonly userData: UserService, private ngZone: NgZone,) {
	  this.socket = io('/pong', {path: '/socket.io/', reconnection: true});
	}

	onOpponentFound(): Observable<{ id: string; connected: boolean; seat: number}> {
		return new Observable((observer) => {
			this.socket.on('opponent-found', (response: { id: string; connected: boolean; seat: number}) => {
				this.player = response.seat;
				observer.next(response);
			});
		});
	}
	
	disconnect(): void{
		this.socket.disconnect();
	}
	
	start(canvas: HTMLCanvasElement): BABYLON.Scene {
		this.ngZone.runOutsideAngular(() => {
			this.initializeEngine(canvas);
			this.createScene();
			this.scene.executeWhenReady(() => this.renderScene());
		});
		this.socket.emit('start', canvas);
		return(this.scene);
	}

	initializeEngine(canvas: HTMLCanvasElement): void {
		this.canvas = canvas;
		this.engine = new BABYLON.Engine(this.canvas, true);
	}

	createScene(){
		if (this.scene) {
			this.scene.dispose();
		}
		this.engine.displayLoadingUI();
		this.scene = new BABYLON.Scene(this.engine);

		//this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
		this.camera = new BABYLON.ArcRotateCamera('camera', 0, 0.5, 50, BABYLON.Vector3.Zero(), this.scene);
		// This targets the camera to scene origin
		this.camera.setTarget(BABYLON.Vector3.Zero());
		// This attaches the camera to the canvas
		this.camera.attachControl(this.canvas, true);
	
		var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.5, 1, -2), this.scene);
		light.intensity = 1;
		light.diffuse = new BABYLON.Color3(0.82, 0.46, 0.97);
		light.specular = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.2, 0.03, 0.22);
	
		var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
		var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
		var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
		racket1.position = new BABYLON.Vector3(0, 4.5, -29);
		racket2.position = new BABYLON.Vector3(0, 4.5, 29);
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		var board = BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", this.scene);
		
		//-------------- NEBULA SKYBOX -----------------
		// var nebula = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", this.scene);
        // nebula.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		var nebula = new BABYLON.CubeTexture("../../assets/skybox/sky", this.scene, null, true);
		this.scene.createDefaultSkybox(nebula, true, 1000);
		const music = new BABYLON.Sound('backgroun-music', "../../assets/Intergalactic Odyssey.ogg", this.scene, null, {loop:true, autoplay:true});


	}
	
	renderScene(): void{
		this.engine.hideLoadingUI();
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

	ballHandler(){
		var ball = this.scene.getMeshByName('ball');
		this.socket.on('ball-update', (position: {x: number; y: number; z: number}) =>{
			if (ball){
				ball.position = new BABYLON.Vector3(position.x, position.y, position.z);
			}
		})
	}
	
	// Function to update the position of the racket
	moveRacket(direction: string): void {
		var racket = this.scene.getMeshByName(this.player === 1 ? 'player1': 'player2');
		if (racket) {
			switch (direction) {
				case 'up':
					racket.position.x -= 0.1;
					break;
				case 'down':
					racket.position.x += 0.1;
					break;
			}
		}
		this.socket.emit('moveRacket', direction);
	}

	// Listen for game-update events from the server
	onPlayerUpdate() {
		this.socket.on('racket-update', (dir: string) => {
			var racketOpp = this.scene.getMeshByName(this.player === 1 ? 'player2': 'player1');
			console.log(dir);
			if (racketOpp) {
				switch (dir) {
					case 'up':
						racketOpp.position.x -= 0.1;
						break;
					case 'down':
						racketOpp.position.x += 0.1;
						break;
					}
				// console.log(racket2.position.x);
			}
		});
		this.socket.on('player-update', () =>{

		});
	}
	
	
}

// Connect to the game if the opponent is connected
//   connectToGame(user: UserLoggedModel) {
	//     this.checkOpponentConnection().subscribe((response) => {
		//       if (response.connected) {
			//         this.socket.emit('game-connect', user);
			//       }
			//     });