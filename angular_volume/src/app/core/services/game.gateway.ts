import { Power } from './../../game/components/pong/dto/power.dto';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserService } from 'src/app/core/services/user.service';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as GUI from '@babylonjs/gui';
// import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class PongGateway {

	private socket!: Socket;
	private engine!: BABYLON.Engine;
	private scene!: BABYLON.Scene;
	private camera!: BABYLON.ArcRotateCamera;
	private HUD!: GUI.AdvancedDynamicTexture;
	private particleSystem!: BABYLON.GPUParticleSystem;
	private player = -1;
	private gameMode!: string

	constructor(private readonly userData: UserService, private ngZone: NgZone,) {
	}
	
	connect(gameMode: string) {
		this.gameMode = gameMode;
		this.socket = io('/pong', {path: '/socket.io/', reconnection: true, reconnectionDelay: 60000, timeout: 60000, query: {gameMode}});
		this.socket.on('disconnect', function (reason) {
		console.log('Socket disconnected because of ' + reason);
		});
		this.socket.on('reconnect', (attemptNumber) => {
			console.log(`Reconnected after ${attemptNumber} attempts`);
		});
		this.socket.on('reconnect_error', (error) => {
			console.error('Reconnection error:', error);
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

	//------------------------------------------------------------------------------------------------------------------------//
	//----------------------------------------------------- SCENE ------------------------------------------------------------//
	//------------------------------------------------------------------------------------------------------------------------//


	start(canvas: HTMLCanvasElement): BABYLON.Scene {
		this.ngZone.runOutsideAngular(() => {
			this.onScoreUpdate();
			this.onPlayerUpdate();
			this.ballHandler();
			this.onGameFinish();
			this.onOpponentDisconnected();
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


		//------------------------- AMBIENT -------------------------------//

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
		var nebula = new BABYLON.CubeTexture("../../assets/skybox/sky", this.scene, null, true);
		this.scene.createDefaultSkybox(nebula, true, 1000);
		const music = new BABYLON.Sound('backgroun-music', "../../assets/Intergalactic Odyssey.ogg", this.scene, null, {loop:true, autoplay:true});


		//------------------------- GUI -----------------------------------//

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
		name1.resizeToFit = true;
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
		name2.resizeToFit = true;
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
		victoryScreen.adaptWidthToChildren = true;
		this.HUD.addControl(victoryScreen);

		var victoryText = new GUI.TextBlock("victoryText");
		victoryText.fontFamily = "Azonic";
		victoryText.top = -20;
		victoryText.color = "orange";
		victoryText.fontSize = "20px";
		victoryText.resizeToFit = true;
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


		//------------------------- MESHES --------------------------------//
	
		let meta = {speed: 1}
		var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{height: 7, radius: 0.5});
		racket1.position = new BABYLON.Vector3(0, 4.5, -29);
		racket1.rotation = new BABYLON.Vector3(0, 0 , 1.57);
		racket1.metadata = meta;
		// racket1.ellipsoid.x = 4;
		var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{height: 7, radius: 0.5});
		racket2.position = new BABYLON.Vector3(0, 4.5, 29);
		racket2.rotation = new BABYLON.Vector3(0, 0 , 1.57);
		racket2.metadata = meta;
		
		var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		ball.material = new BABYLON.StandardMaterial("ballMat", this.scene);
		(ball.material as BABYLON.StandardMaterial).ambientColor = new BABYLON.Color3(1, 0, 0);
		ball.metadata.move = new BABYLON.Vector3(0, 0, 0.4);

		BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", this.scene, (meshes)=> {
			meshes[1].name = 'board';
		});


		if (this.gameMode === "special")
		{
			var fountain = BABYLON.MeshBuilder.CreateBox("foutain", {}, this.scene);
			fountain.visibility = 0;
			ball.checkCollisions = true;
			ball.onCollide = (collidedMesh) => {
				if (ball.metadata.lastPlayer === this.player){
					collidedMesh?.metadata.power.effect(this.player === 1 ? racket1: racket2);
					this.socket.emit('player-update', collidedMesh?.metadata.power);
				}
				collidedMesh?.dispose();
			}
		}

	}
	
	createNewSystem() {
		var fountain = this.scene.getMeshByName("fountain");
		if (this.particleSystem) {
			this.particleSystem.dispose();
		}
		
		this.particleSystem = new BABYLON.GPUParticleSystem("particles", { capacity:1000}, this.scene);
		var customEmitter = new BABYLON.CustomParticleEmitter();
		// Colors of all particles
		this.particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		this.particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		this.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		this.particleSystem.isLocal = true;
		let id = 0;
		customEmitter.particlePositionGenerator = (index, particle, out) => {
			out.x = Math.cos(id) * 5;
			out.y = 0;
			out.z = Math.sin(id) * 5;;
			id += 0.5;
		}
		customEmitter.particleDestinationGenerator = (index, particle, out) => {
			out.x = 0;
			out.y = 0;
			out.z = 0;
		}
		this.particleSystem.particleEmitterType = customEmitter;
		this.particleSystem.particleTexture = new BABYLON.Texture("/textures/flare.png", this.scene);
		this.particleSystem.emitRate = 1000;
		this.particleSystem.maxLifeTime = 1;
		this.particleSystem.minLifeTime = 1;
		this.particleSystem.minSize = 0.1;
		this.particleSystem.maxSize = 0.9;
		this.particleSystem.updateSpeed = 0.01;
		this.particleSystem.targetStopDuration = 2;
		this.particleSystem.emitter = fountain;
	}

	
	spawnPowerUp(data: {position: BABYLON.Vector3, power: Power}) {
		var fountain = this.scene.getMeshByName("fountain")!;
		this.createNewSystem();
		var orb = BABYLON.MeshBuilder.CreateSphere("orb", {}, this.scene);

		var material = new BABYLON.StandardMaterial('material', this.scene);
		material.alpha = 0.5; // Set the transparency level as needed
		orb.material = material;
		orb.metadata.power = data.power;
		// Load the image as a texture
		var texture = new BABYLON.Texture(data.power.texture, this.scene);
		texture.hasAlpha = true;
		// Create a plane inside the orb
		var plane = BABYLON.MeshBuilder.CreatePlane('plane', { size: 1 }, this.scene);
		plane.material = new BABYLON.StandardMaterial('planeMaterial', this.scene);
		(plane.material as BABYLON.StandardMaterial).diffuseTexture = texture;
		plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		plane.visibility = 0;

		// Attach the plane to the orb
		plane.parent = orb;

		// Animation parameters
		var animationScale = 0.2;
		var animationSpeed = 2;

		// Define the animation
		var pulseAnimation = new BABYLON.Animation(
		'pulseAnimation',
		'scaling',
		60,
		BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
		BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
		);
		// Animation keyframes
		var keys = [];
		keys.push({
		frame: 0,
		value: new BABYLON.Vector3(1, 1, 1),
		});
		keys.push({
		frame: 30,
		value: new BABYLON.Vector3(1 + animationScale, 1 + animationScale, 1 + animationScale),
		});
		keys.push({
		frame: 60,
		value: new BABYLON.Vector3(1, 1, 1),
		});

		pulseAnimation.setKeys(keys);

		// Attach the animation to the plane
		plane.animations = [pulseAnimation];

		// Run the animation
		this.scene.beginAnimation(plane, 0, 60, true, animationSpeed);
		orb.metadata
		orb.position.copyFrom(data.position);
		orb.checkCollisions = true;
		orb.visibility = 0;
		fountain.position.copyFrom(data.position);
		this.particleSystem.start();
	}	

	renderScene(): void{
		var ball = this.scene.getMeshByName('ball')!;
		var power = this.scene.getMeshByName('orb')!;
		this.engine.hideLoadingUI();
		this.scene.onBeforeRenderObservable.add(() => {
            if(this.particleSystem && this.particleSystem.isStopped())
            {
                power.visibility = 1;
                if (power.getChildren()[0])
                    (power.getChildren()[0] as BABYLON.Mesh).visibility = 1;
                if (power.position.y > 4.5)
                    power.position.y -= 0.1;
            }
		});
		this.socket.emit('start');
		this.engine.runRenderLoop(()=> {
			this.scene.render();
			ball.moveWithCollisions(ball.metadata.move);
		});
	}
	
	stop(): void {
		this.scene.dispose();
		this.engine.stopRenderLoop();
		this.engine.dispose();
		this.camera.dispose();
	}


	//----------------------------------------------------------------------------------------------------------------------//
	//-------------------------------------------------- EVENT HANDLERS ----------------------------------------------------//
	//----------------------------------------------------------------------------------------------------------------------//

	ballHandler(){
		this.socket.on('ball-update', (payload: {move: BABYLON.Vector3, last_hit: number}) =>{
			var ball = this.scene.getMeshByName('ball');
			if (ball){
				ball.metadata.move = payload.move;
				ball.metadata.lastPlayer = payload.last_hit;
			}
		})
	}
	
	onPowerUpdate(){
		this.socket.on('power-update', (data: {position: BABYLON.Vector3, power: Power}) =>{
			this.spawnPowerUp(data);
		})
	}

	// Function to update the position of the racket
	moveRacket(direction: string): void {
		var racket = this.scene.getMeshByName(this.player === 1 ? 'player1': 'player2');
		if (racket) {
			switch (direction) {
				case 'up':
					racket.position.x -= 0.1 * racket.metadata.speed;
					// racket.moveWithCollisions( new BABYLON.Vector3(-0.1, 0 , 0));
					break;
				case 'down':
					racket.position.x += 0.1 * racket.metadata.speed;;
					// racket.moveWithCollisions( new BABYLON.Vector3(0.1, 0 , 0));
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
						racketOpp.position.x -= 0.1 * racketOpp.metadata.speed;;
                        // racketOpp.moveWithCollisions( new BABYLON.Vector3(-0.1, 0 , 0));
						break;
					case 'down':
						racketOpp.position.x += 0.1 * racketOpp.metadata.speed;;
                        // racketOpp.moveWithCollisions( new BABYLON.Vector3(0.1, 0 , 0));
						break;
					}
				// console.log(racketOpp.position.x);
			}
		});
		this.socket.on('player-update', (power: Power) =>{
			var racketOpp = this.scene.getMeshByName(this.player === 1 ? 'player2': 'player1')!;
			power.effect(racketOpp);
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
	
	onOpponentDisconnected() {
		this.socket.on('opp-disconnect',() => {
			console.log('opponent disconnected');
			let victoryText = this.HUD.getControlByName('victoryText') as GUI.TextBlock;
			victoryText.text = 'Opponent disconnected';
			var victoryScreen = this.HUD.getControlByName('victory')!;
			victoryScreen.isVisible = true;
		});
	}
}
