import { Enlarge, Power, Shield, Speed } from './../../game/components/pong/dto/power.dto';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import * as GUI from '@babylonjs/gui';
import { UserInfo } from 'src/app/models/userInfo.model';
// import { Inspector } from '@babylonjs/inspector';

@Injectable()
export class PongGateway {

	private socket!: Socket;
	private user!: UserInfo;
	private opponent!: string;
	private engine!: BABYLON.Engine;
	private scene!: BABYLON.Scene;
	private camera!: BABYLON.ArcRotateCamera;
	private HUD!: GUI.AdvancedDynamicTexture;
	private particleSystem!: BABYLON.GPUParticleSystem;
	private hl!: BABYLON.HighlightLayer;
	private player = -1;
	private gameMode!: string
	private index = -1;
	private started = false;

	constructor(private ngZone: NgZone,) {
	}
	
	connect(gameMode: string, user: UserInfo) {
		this.gameMode = gameMode;
		this.user = user;
		
		this.socket = io('/pong', {path: '/socket.io/', reconnection: true, reconnectionDelay: 60000, timeout: 60000, query: {gameMode, name: user.username}});
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

	onOpponentFound(): Observable<{ client: string ; username: string; seat: number}> {
		return new Observable((observer) => {
			this.socket.on('opponent-found', (response: { client: string; username: string; seat: number}) => {
				this.player = response.seat;
				this.opponent = response.username;
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
			this.waitForPlayer();
			this.onScoreUpdate();
			this.onPlayerUpdate();
			this.onPowerUpdate();
			this.ballHandler();
			this.onGameFinish();
			this.onOpponentDisconnected();
			this.createScene(canvas);
			this.scene.executeWhenReady(() => this.renderScene());
		});
		return(this.scene);
	}
	
	
	async createScene(canvas: HTMLCanvasElement){
		this.engine = new BABYLON.Engine(canvas, true, {stencil: true});
		if (this.scene) {
			this.scene.dispose();
		}
		this.engine.displayLoadingUI();
		this.scene = new BABYLON.Scene(this.engine);
		this.hl = new BABYLON.HighlightLayer("hl1", this.scene);
		this.HUD = GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI", undefined, this.scene, undefined, true);
		this.scene.collisionsEnabled = true;


		//------------------------- AMBIENT -------------------------------//
		this.camera = new BABYLON.ArcRotateCamera('camera', 0, 0.5, 100, BABYLON.Vector3.Zero(), this.scene);
		this.camera.setTarget(BABYLON.Vector3.Zero());
		// This attaches the camera to the canvas
		this.camera.attachControl(canvas, true);
	
		var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.35, 1, -1), this.scene);
		light.intensity = 1;
		var nebula = new BABYLON.CubeTexture("../../assets/skybox/sky", this.scene, null, true);
		this.scene.createDefaultSkybox(nebula, true, 1000);
		const music = new BABYLON.Sound('music', "../../assets/Intergalactic Odyssey.ogg", this.scene, null, {loop:true, volume: 0.1});
		const BallBounce = new BABYLON.Sound('pong-bounce', "../../assets/pong.wav", this.scene, null);
		const PowerSound = new BABYLON.Sound('power-sound', "../../assets/power.wav", this.scene, null);

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
		name1.text = this.player === 1 ? this.user.username : this.opponent;
		name1.top = -20;
		name1.color = "orange";
		name1.fontSize = "14px";
		name1.resizeToFit = true;
		name1.paddingLeft = 15;
		name1.paddingRight = 15;
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
		name2.text = this.player === 2 ? this.user.username : this.opponent;
		name2.color = "orange";
		name2.fontSize = "14px";
		name2.resizeToFit = true;
		name2.paddingLeft = 15;
		name2.paddingRight = 15;
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
		victoryScreen.cornerRadius = 20;
		victoryScreen.adaptWidthToChildren = true;
		this.HUD.addControl(victoryScreen);

		var victoryText = new GUI.TextBlock("victoryText");
		victoryText.fontFamily = "Azonic";
		victoryText.top = -20;
		victoryText.color = "orange";
		victoryText.fontSize = "20px";
		victoryText.resizeToFit = true;
		victoryText.text = "Waiting for players ...";
		victoryText.paddingLeft = 15;
		victoryText.paddingRight = 15;
		victoryScreen.addControl(victoryText);

		var exitBtn = GUI.Button.CreateSimpleButton("exit", "EXIT");
		exitBtn.width = "100px";
		exitBtn.height = "50px";
		exitBtn.fontFamily = "Azonic";
		exitBtn.top = 20;
		exitBtn.color = "orange";
		exitBtn.fontSize = "20px";
		exitBtn.isVisible = false;
		exitBtn.onPointerUpObservable.add( () =>{
			window.location.href = '/trascendence/home';
		});
		victoryScreen.addControl(exitBtn);


		//------------------------- MESHES --------------------------------//
	
		var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{height: 7, radius: 0.5});
		racket1.position = new BABYLON.Vector3(0, 4.5, -29);
		racket1.rotation = new BABYLON.Vector3(0, 0 , 1.57);

		var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{height: 7, radius: 0.5});
		racket2.position = new BABYLON.Vector3(0, 4.5, 29);
		racket2.rotation = new BABYLON.Vector3(0, 0 , 1.57);

		var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		ball.material = new BABYLON.StandardMaterial("ballMat", this.scene);
		(ball.material as BABYLON.StandardMaterial).diffuseColor = new BABYLON.Color3(1, 0, 0);
		ball.metadata = {
			lastPlayer: -1,
		};

		BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", this.scene, (meshes)=> {
			meshes[1].name = 'board';
		});


		if (this.gameMode === "special")
		{
			var fountain = BABYLON.MeshBuilder.CreateBox("fountain", {}, this.scene);
			fountain.visibility = 0;
			ball.checkCollisions = true;
			var orb = BABYLON.MeshBuilder.CreateSphere("orb", {diameter: 2.5}, this.scene);
			orb.visibility = 0;

			var shield1 = BABYLON.MeshBuilder.CreateCylinder('shield1', {height: 34, diameter: 2.5})
			shield1.position = new BABYLON.Vector3(0, 4.5, -24);
			shield1.rotation = new BABYLON.Vector3(0, 0 , 1.57);
			shield1.material = await BABYLON.NodeMaterial.ParseFromSnippetAsync('2VUFZ8#5');
			shield1.material.backFaceCulling = false;
			shield1.visibility = 0;
			racket1.metadata = {speed: 1, shield: shield1};

			var shield2 = BABYLON.MeshBuilder.CreateCylinder('shield2', {height: 34, diameter: 2.5})
			shield2.position = new BABYLON.Vector3(0, 4.5, 24);
			shield2.rotation = new BABYLON.Vector3(0, 0 , 1.57);
			shield2.material = await BABYLON.NodeMaterial.ParseFromSnippetAsync('2VUFZ8#5');
			shield2.material.backFaceCulling = false;
			shield2.visibility = 0;
			racket2.metadata = {speed: 1, shield: shield2};
			
			ball.onCollide = (collidedMesh) => {
				if (ball.metadata.lastPlayer === this.player){
					collidedMesh?.metadata.power.effect(this.player === 1 ? racket1: racket2);
					this.socket.emit('player-update', collidedMesh?.metadata.power);
				}
				collidedMesh?.dispose();
				PowerSound.play();
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
		this.particleSystem.particleTexture = new BABYLON.Texture("../../assets/blue-light-star.png", this.scene);
		this.particleSystem.emitRate = 1000;
		this.particleSystem.maxLifeTime = 1;
		this.particleSystem.minLifeTime = 1;
		this.particleSystem.minSize = 0.1;
		this.particleSystem.maxSize = 0.9;
		this.particleSystem.updateSpeed = 0.01;
		this.particleSystem.targetStopDuration = 2;
		this.particleSystem.emitter = fountain;
	}

	
	spawnPowerUp(position: BABYLON.Vector3, power: Power) {
		var fountain = this.scene.getMeshByName("fountain")!;
		var orb = this.scene.getMeshByName("orb")! as BABYLON.Mesh;
		this.createNewSystem();
		var material = new BABYLON.StandardMaterial('material', this.scene);
		this.index++;
		let clone = orb.clone("power" + this.index);
		let powerParticles = new BABYLON.ParticleSystem("power-up", 2000, this.scene);
		powerParticles.particleTexture = new BABYLON.Texture("../../assets/blue-light-star.png", this.scene);
		powerParticles.emitter = clone;
		powerParticles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
		powerParticles.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
		powerParticles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		powerParticles.minSize = 0.1;
		powerParticles.maxSize = 0.9;
		powerParticles.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
		powerParticles.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
		powerParticles.start(3500);
		clone.alwaysSelectAsActiveMesh = true;
		material.alpha = 0.5; // Set the transparency level as needed
		clone.material = material;
		clone.metadata = {power: power}
		this.hl.addMesh(clone, BABYLON.Color3.White());
		// Load the image as a texture
		var texture = new BABYLON.Texture(power.texture, this.scene);
		texture.hasAlpha = true;
		// Create a plane inside the clone
		var plane = BABYLON.MeshBuilder.CreatePlane('plane', { size: 1.5 }, this.scene);
		plane.material = new BABYLON.StandardMaterial('planeMaterial', this.scene);
		(plane.material as BABYLON.StandardMaterial).diffuseTexture = texture;
		plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
		plane.visibility = 0;

		// Attach the plane to the clone
		plane.parent = clone;

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
		clone.position.copyFrom(position);
		clone.checkCollisions = true;
		clone.visibility = 0;
		fountain.position.copyFrom(position);
		this.particleSystem.start();
	}	

	renderScene(): void{
		var ball = this.scene.getMeshByName('ball')!;
		this.engine.hideLoadingUI();
		this.scene.onBeforeRenderObservable.add(() => {
			if(this.particleSystem && this.particleSystem.isStopped())
            {
				var power = this.scene.getMeshByName('power' + this.index);
				if (power){
					power.visibility = 1;
					if (power.getChildren()[0])
						(power.getChildren()[0] as BABYLON.Mesh).visibility = 1;
					if (power.position.y > 4.5)
						power.position.y -= 0.1;
				}
            }
		});
		this.socket.emit('start');
		this.engine.runRenderLoop(()=> {
			this.scene.render();
		});
		window.addEventListener("resize", () => {
			this.engine.resize();
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

	waitForPlayer(){
		this.socket.on('start', () =>{
			var music = this.scene.getSoundByName('music')!;
			let victoryScreen = this.HUD.getControlByName('victory')!;
			let button = this.HUD.getControlByName('exit')!;
			victoryScreen.isVisible = false;
			button.isVisible = true;
			music.play();
			this.started = true;
		})
	}

	ballHandler(){
		this.socket.on('ball-update', (payload: {move: BABYLON.Vector3, lastPlayer: number}) =>{
			var ball = this.scene.getMeshByName('ball')!;
			let vector = new BABYLON.Vector3(0,0,0);
			ball.metadata = {lastPlayer: payload.lastPlayer};
			vector.copyFrom(payload.move);
			ball.moveWithCollisions(vector);
		});
		this.socket.on('ball-collide', ()=> {
			this.scene.getSoundByName('pong-bounce')?.play();
		});
	}
	
	onPowerUpdate(){
		this.socket.on('power-update', (data: {position: BABYLON.Vector3, power: string}) =>{
			var power;
			switch (data.power) {
				case 'Enlarge':
					power = new Enlarge();
					break;
				case 'Speed':
					power = new Speed;
					break;
				case 'Shield':
					power = new Shield;
					break;
				default:
					throw new Error(`Unknown power type: ${data.power}`);
			}
			this.spawnPowerUp(data.position, power);
		})
	}

	// Function to update the position of the racket
	moveRacket(direction: string): void {
		var racket = this.scene.getMeshByName(this.player === 1 ? 'player1': 'player2')!;
		const maxPos = racket.scaling.y > 1 ? 5 : 7;
		if  (this.started){
			const speed = racket.metadata?.speed || 1;
			switch (direction) {
				case 'up':
					if (racket.position.x > -maxPos){
						racket.position.x -= 0.1 * speed;
						this.socket.emit('moveRacket', direction);
					}
					break;
				case 'down':
					if (racket.position.x < maxPos){
						racket.position.x += 0.1 * speed;
						this.socket.emit('moveRacket', direction);
					}
					break;
			}
		}
	}

	// Listen for data-update events from the server
	onPlayerUpdate() {
		this.socket.on('racket-update', (dir: string) => {
			var racketOpp = this.scene.getMeshByName(this.player === 1 ? 'player2': 'player1');
			if (racketOpp) {
				const speed = racketOpp.metadata?.speed || 1;
				switch (dir) {
					case 'up':
						racketOpp.position.x -= 0.1 * speed;
						break;
					case 'down':
						racketOpp.position.x += 0.1 * speed;
						break;
					}
			}
		});
		this.socket.on('player-update', (power: Power) =>{
			var racketOpp = this.scene.getMeshByName(this.player === 1 ? 'player2': 'player1')!;
			var pcopy;
			switch (power.type) {
				case 'Enlarge':
					pcopy = new Enlarge();
					break;
				case 'Speed':
					pcopy = new Speed;
					break;
				case 'Shield':
					pcopy = new Shield;
					break;
				default:
					throw new Error(`Unknown power type: ${power.type}`);
			}
			pcopy.effect(racketOpp);
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

	onGameFinish() :Observable<boolean> {
		return new Observable((observer) =>{
			this.socket.on('finished', (winner: number) => {
				let victoryText = this.HUD.getControlByName('victoryText') as GUI.TextBlock;
				let player1 = this.HUD.getControlByName('name1') as GUI.TextBlock;
				let player2 = this.HUD.getControlByName('name2') as GUI.TextBlock;
				victoryText.text = (winner === 1 ? player1.text : player2.text) + ' won !';
				var victoryScreen = this.HUD.getControlByName('victory')!;
				victoryScreen.isVisible = true;
				let won;
				if (winner === 1)
					won = this.player === 1 ? true : false;
				else
					won = this.player === 2 ? true : false;
				observer.next(won);
			});
		});
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
