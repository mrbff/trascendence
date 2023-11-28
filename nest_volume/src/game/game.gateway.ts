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
import * as BABYLON from 'babylonjs';

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
	private engine!: BABYLON.Engine;
	// private scene!: BABYLON.Scene;

	//---------------------- CONNECTION HANDLING -------------------------//

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

	//---------------------- GAME LOGIC -------------------------//

	
	@SubscribeMessage('start')
	start(client: Socket) {
		let room = this.findClientRoom(client);
		if (room){
			if (!room.data.scene)
			this.createScene(room);
			this.gameLoop(room);
		}
}

	createScene(room: {name: string; data: GameInfo}){
		this.engine = new BABYLON.NullEngine();
		if (room.data.scene) {
			room.data.scene.dispose();
		}
		this.engine.displayLoadingUI();
		room.data.scene = new BABYLON.Scene(this.engine);
		room.data.scene.collisionsEnabled = true;
		var ball = BABYLON.MeshBuilder.CreateSphere('ball', );
		var ballbody = new BABYLON.PhysicsAggregate(ball, BABYLON.PhysicsShapeType.SPHERE, { mass: 0}, room.data.scene);
		var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
		var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2',{orientation: BABYLON.Vector3.Left(),height: 7, radius: 0.5});
		var racket1body =  new BABYLON.PhysicsAggregate(racket1, BABYLON.PhysicsShapeType.CAPSULE, { mass: 0}, room.data.scene);
		var racket2body =  new BABYLON.PhysicsAggregate(racket2, BABYLON.PhysicsShapeType.CAPSULE, { mass: 0}, room.data.scene);
		racket1.position = new BABYLON.Vector3(0, 4.5, -29);
		racket2.position = new BABYLON.Vector3(0, 4.5, 29);
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		var board = BABYLON.SceneLoader.ImportMesh("", "../../assets/", "test.glb", room.data.scene, (mesh)=> { mesh[0].checkCollisions = true; mesh[0].receiveShadows = true; });
	}

	// stop(): void {
	// 	this.scene.dispose();
	// 	this.engine.dispose();
	// }

	gameLoop(room: {name: string; data: GameInfo}) {
		var ball = room.data.scene?.getMeshByName('ball');
		var racket1 = room.data.scene?.getMeshByName('player1');
		var racket2 = room.data.scene?.getMeshByName('player2');
		var board =  room.data.scene?.getMeshByName('board');
		const move = new BABYLON.Vector3(0, 0, 0.5);
		// Set up onCollide handler for the ball
		if(ball)
			ball.onCollide = (collidedMesh) => {
				if (collidedMesh === racket1) {

				} else if (collidedMesh === racket2) {

				} else if (collidedMesh === board) {

				}
			};
		room.data.scene?.onBeforeRenderObservable.add(() => {
			ball?.moveWithCollisions(move);
			this.server.to(room.name).emit('ball-update', ball?.position);
		});
	}


	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, direction: string): void {
			let room = this.findClientRoom(client);
			if (!room)
				return
			/*------------------------------------------*/
			var racket = room.data.scene?.getMeshByName(client === room.data.player1 ? 'player1': 'player2');
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
			client.to(room.name).emit('racket-update', direction);
		}
	


	//-------------------------- UTILITY ------------------------------------//
	findClientRoom(client: Socket) {
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
		return (room);
	}
	
	/* 	@SubscribeMessage('game-connect')
		handleGameConnect(client: Socket, user: { id: string; name: string }): void {
		// Handle the game-connect event here
		// Example: You can log the connected user or perform other actions
		client.join(user.id);

		console.log(`\n\n${user.name} connected to the game`);
		} */
	}
  