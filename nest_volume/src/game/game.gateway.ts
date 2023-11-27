import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameInfo } from './dto/gameInfo.dto';
import * as BABYLON from '@babylonjs/core';

@WebSocketGateway({
	namespace: '/pong',
	cors: {
		origin: '*',
	  credentials: true,
	},
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;
	queue: Socket[] = [];
	rooms: {name: string; data: GameInfo}[] = [];
	// private socket: Socket;
	// private engine!: BABYLON.Engine;
	// private scene!: BABYLON.Scene;
	// private canvas!: HTMLCanvasElement;
	// private camera!: BABYLON.ArcRotateCamera;
	// private player: number = -1;
	
  
	afterInit(server: Server) {
	  console.log('\n\nInitialized!(pong)');
	}
  
	handleConnection(client: Socket) {
		this.queue.push(client);
		console.log(`\n\nClient connected(pong): ${client.id}`);
		this.matchmake();
	}

	handleDisconnect(client: Socket) {
		console.log(`\n\nClient disconnected(pong): ${client.id}`);
		this.removeFromQueue(client);
		// for (let room of client.rooms){
		// 	client.leave(room);
		// 	this.rooms = this.rooms.filter((r) => !(r.name === room));
		// }
	  }

	private removeFromQueue(client: Socket) {
	this.queue = this.queue.filter((c) => c.id !== client.id);
	}

	private matchmake() {
	// Implement your matchmaking logic here
		if (this.queue.length >= 2) {
			const player1 = this.queue[0];
			const player2 = this.queue[1];
			this.queue.pop();
			this.queue.pop();

			// Create a room for the matched players
			let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
			player1?.join(roomName);
			player2?.join(roomName);
			let size = this.rooms.push({name: roomName, data: {player1: player1, player2: player2, score1: 0, score2: 0}});
			// Notify players about the match
			console.log(`\n\nMatch found! Players ${player1?.id} and ${player2?.id} are in room ${roomName}`);
			player1?.emit('opponent-found', {user: player2.id, connected: true, seat: 1});
			player2?.emit('opponent-found', {user: player1.id, connected: true, seat: 2});
		}
	}

	// gameLoop() {
	// 	var ball = {position: {x: 0, y: 0, z: 0}, dir: 1};
	// 	while (1)
	// 	{
	// 		ball
	// 	}

	// }

	//   start(canvas: HTMLCanvasElement): BABYLON.Scene {
	// 	  this.ngZone.runOutsideAngular(() => {
	// 		  this.initializeEngine(canvas);
	// 		  this.createScene();
	// 		  this.renderScene();
	// 	  });
	// 	  return(this.scene);
	//   }
  
	//   initializeEngine(canvas: HTMLCanvasElement): void {
	// 	  this.canvas = canvas;
	// 	  this.engine = new BABYLON.Engine(this.canvas, true);
	//   }
  
	//   createScene(){
	// 	  if (this.scene) {
	// 		  this.scene.dispose();
	// 	  }
	// 	  this.engine.displayLoadingUI();
	// 	  this.scene = new BABYLON.Scene(this.engine);
  
	// 	  //this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
	// 	  this.camera = new BABYLON.ArcRotateCamera('camera', 0, 0.5, 50, BABYLON.Vector3.Zero(), this.scene);
	// 	  // This targets the camera to scene origin
	// 	  this.camera.setTarget(BABYLON.Vector3.Zero());
	// 	  // This attaches the camera to the canvas
	// 	  this.camera.attachControl(this.canvas, true);
	  
	// 	  var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.5, 1, -2), this.scene);
	// 	  light.intensity = 1;
	// 	  light.diffuse = new BABYLON.Color3(0.82, 0.46, 0.97);
	// 	  light.specular = new BABYLON.Color3(1, 1, 1);
	// 	  light.groundColor = new BABYLON.Color3(0.2, 0.03, 0.22);
	  
	// 	  var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
	// 	  var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
	// 	  var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
	// 	  racket1.position = new BABYLON.Vector3(0, 4.5, -29);
	// 	  racket2.position = new BABYLON.Vector3(0, 4.5, 29);
	// 	  ball.position = new BABYLON.Vector3(0, 4.5, 0);
	// 	  var board = BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", this.scene);
		  
	// 	  /*-------------- NEBULA SKYBOX -----------------*/
	// 	  // var nebula = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", this.scene);
	// 	  // nebula.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	// 	  var nebula = new BABYLON.CubeTexture("../../assets/skybox/sky", this.scene, null, true);
	// 	  this.scene.createDefaultSkybox(nebula, true, 1000);
	// 	  const music = new BABYLON.Sound('backgroun-music', "../../assets/Intergalactic Odyssey.ogg", this.scene, null, {loop:true, autoplay:true});
  
  
	//   }
	  
	//   renderScene(){
	// 	  this.engine.hideLoadingUI();
	// 	  this.engine.runRenderLoop(()=> {
	// 		  this.scene.render();
	// 	  });
	//   }
	  
	//   stop(): void {
	// 	  this.scene.dispose();
	// 	  this.engine.stopRenderLoop();
	// 	  this.engine.dispose();
	// 	  this.camera.dispose();
	//   }
  


	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, direction: string): void {
		const roomNames = Array.from(client.rooms.values()).filter((room) => room !== client.id);
		if (roomNames.length === 0) {
			console.error(`Client ${client.id} is not in any room.`);
			return;
		}
		const roomName = roomNames[0]; 
		//console.log(roomName);
		var room = this.rooms.find((r) => r.name === roomName);
		if (!room) {
			console.error(`Room not found for client ${client.id}`);
			return;
		}
		// console.log(direction);
		/*------------------------------------------*/
		client.to(roomName).emit('racket-update', direction);
	}
  
	@SubscribeMessage('game-connect')
	handleGameConnect(client: Socket, user: { id: string; name: string }): void {
	  // Handle the game-connect event here
	  // Example: You can log the connected user or perform other actions
	  client.join(user.id);

	  console.log(`\n\n${user.name} connected to the game`);
	}
}
  