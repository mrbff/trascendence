import { Power } from './dto/power.dto';
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
import 'babylonjs-loaders'
import * as fs from 'fs';

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
	private normalQueue: Socket[] = [];
	private specialQueue: Socket[] = [];
	private rooms: {name: string; data: GameInfo}[] = [];
	private engine!: BABYLON.Engine;
	private playersReady: Set<string> = new Set(); // Set to track players who have sent the "start" signal

	//---------------------- CONNECTION HANDLING -------------------------//

	afterInit(server: Server) {
	  console.log('\n\nInitialized!(pong)');
	}
  
	handleConnection(client: Socket) {
		if (client.handshake.query.gameMode === "normal"){
			this.normalQueue.push(client);
			this.matchmake(this.normalQueue, "normal");
		}
		else{
			this.specialQueue.push(client);
			this.matchmake(this.specialQueue, "special");
		}
		console.log(`\n\nClient connected(pong): ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`\n\nClient disconnected(pong): ${client.id}`);
		this.removeFromQueue(client);
		for (var room of this.rooms)
		{
			if (room.data.player1 === client || room.data.player2 === client){
				if (this.engine)
					this.engine.stopRenderLoop();
				room.data.scene?.dispose();
				if (room.data.winner == -1){
					let other = room.data.player1 === client ? room.data.player2 : room.data.player1;
					console.log(other.id);
					
					other.emit('opp-disconnect');
				}
				this.rooms.splice(this.rooms.indexOf(room), 1);
			}
			break;
		}
	}

	private removeFromQueue(client: Socket) {
		if (this.normalQueue.find((c) => c.id == client.id))
			this.normalQueue = this.normalQueue.filter((c) => c.id !== client.id);
		else
			this.specialQueue = this.specialQueue.filter((c) => c.id !== client.id);
	}

	private matchmake(queue: Socket[], mode: string) {
	// Implement your matchmaking logic here
		if (queue.length >= 2) {
			const player1 = queue[0];
			const player2 = queue[1];
			queue.pop();
			queue.pop();
			// Create a room for the matched players
			let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
			player1?.join(roomName);
			player2?.join(roomName);
			let size = this.rooms.push({name: roomName, data: {player1: player1, player2: player2, score1: 0, score2: 0, winner: -1, mode: mode}});
			// Notify players about the match
			console.log(`\n\nMatch found! Players ${player1?.id} and ${player2?.id} are in room ${roomName}`);
			console.log(this.rooms.length);
			player1?.emit('opponent-found', {user: player2.id, connected: true, seat: 1});
			player2?.emit('opponent-found', {user: player1.id, connected: true, seat: 2});
		}
	}

	//---------------------- GAME LOGIC -------------------------//


	@SubscribeMessage('start')
	start(client: Socket) {
	  let room = this.findClientRoom(client);
	  if (room) {
		this.playersReady.add(client.id);
		// Check if all players in the room have sent the "start" signal
		if (this.playersReady.size === 2) {
		  this.handleStart(room);
		}
	  }
	}
  
	private handleStart(room: {name: string; data: GameInfo}) {
	  // Reset the playersReady set for the next round
	  this.playersReady.clear();
  
	  if (!room.data.scene) {
		this.createScene(room);
		room.data.scene!.executeWhenReady(() => this.initHandlers(room));
	  }
	}
	
	createScene(room: {name: string; data: GameInfo}){
		this.engine = new BABYLON.NullEngine();
		if (room.data.scene) {
			room.data.scene.dispose();
		}
		room.data.scene = new BABYLON.Scene(this.engine);
		room.data.scene.collisionsEnabled = true;
		room.data.scene.performancePriority = BABYLON.ScenePerformancePriority.Aggressive;
		var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, BABYLON.Vector3.Zero(), room.data.scene);
		var ball = BABYLON.MeshBuilder.CreateSphere('ball', undefined, room.data.scene);
		ball.position = new BABYLON.Vector3(0, 4.5, 0);
		ball.checkCollisions = true;

        // Create the main capsule mesh
        var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1', { height: 7, radius: 0.5 }, room.data.scene);
        racket1.position = new BABYLON.Vector3(0, 4.5, -29);
        racket1.rotation = new BABYLON.Vector3(0, 0, 1.57);
        // racket1.ellipsoid.x = 4;
        racket1.checkCollisions = true;

        // Create the bottom collider
        var c1Bottom = BABYLON.MeshBuilder.CreatePlane('c1Bottom', {height: 2, sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Bottom.position = new BABYLON.Vector3(0, -2.25, 0.55); // Adjust the position of the bottom collider
        c1Bottom.parent = racket1; // Make it a child of the main mesh
        c1Bottom.checkCollisions = true;
        c1Bottom.visibility = 0;

        // Create the middle collider
        var c1Middle = BABYLON.MeshBuilder.CreatePlane('c1Middle', {height: 2,sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Middle.position = new BABYLON.Vector3(0, 0, 0.55); // Adjust the position of the middle collider
        c1Middle.parent = racket1; // Make it a child of the main mesh
        c1Middle.checkCollisions = true;
        c1Middle.visibility = 0;

        // Create the top collider
        var c1Top = BABYLON.MeshBuilder.CreatePlane('c1Top', {height: 2,sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Top.position = new BABYLON.Vector3(0, 2.25, 0.55); // Adjust the position of the top collider
        c1Top.parent = racket1; // Make it a child of the main mesh
        c1Top.checkCollisions = true;
        c1Top.visibility = 0;


        var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2', { height: 7, radius: 0.5 }, room.data.scene);
        racket2.position = new BABYLON.Vector3(0, 4.5, 29);
        racket2.rotation = new BABYLON.Vector3(0, 0, 1.57);
        // racket2.ellipsoid.x = 4;
        racket2.checkCollisions = true;

        // Create the bottom collider
        var c2Bottom = BABYLON.MeshBuilder.CreatePlane('c2Bottom', {height: 2}, room.data.scene);
        c2Bottom.position = new BABYLON.Vector3(0, -2.25, -0.55); // Adjust the position of the bottom collider
        c2Bottom.parent = racket2; // Make it a child of the main mesh
        c2Bottom.checkCollisions = true;
        c2Bottom.visibility = 0;
        // Create the middle collider
        var c2Middle = BABYLON.MeshBuilder.CreatePlane('c2Middle', {height: 2}, room.data.scene);
        c2Middle.position = new BABYLON.Vector3(0, 0, -0.55); // Adjust the position of the middle collider
        c2Middle.parent = racket2; // Make it a child of the main mesh
        c2Middle.checkCollisions = true;
        c2Middle.visibility = 0;
        // Create the top collider
        var c2Top = BABYLON.MeshBuilder.CreatePlane('c2Top', {height: 2}, room.data.scene);
        c2Top.position = new BABYLON.Vector3(0, 2.25, -0.55); // Adjust the position of the top collider
        c2Top.parent = racket2; // Make it a child of the main mesh
        c2Top.checkCollisions = true;
        c2Top.visibility = 0;

		const data = fs.readFileSync('/usr/src/app/src/game/assets/test.glb');
		// Convert the binary string to a data URL
		var planOBB = BABYLON.MeshBuilder.CreateBox("OBB", undefined, room.data.scene);
		const dataUrl = 'data:model/gltf-binary;base64,' + Buffer.from(data).toString('base64');
		var board = BABYLON.SceneLoader.ImportMesh("", "", dataUrl, room.data.scene, (meshes)=> {
			meshes[1].name = 'board';
			meshes[1].checkCollisions = true;
			meshes[1].receiveShadows = true;
			planOBB.parent = meshes[1];
		});

		var cornerSE = BABYLON.MeshBuilder.CreatePlane('cornerSE', {width:10, height: 3}, room.data.scene);
		cornerSE.rotation = new BABYLON.Vector3(0, 0.8, 0);
		cornerSE.position = new BABYLON.Vector3(13.8, 4.5, 25.5)
		cornerSE.checkCollisions = true;
		var cornerSO = BABYLON.MeshBuilder.CreatePlane('cornerSO', {width:10, height: 3}, room.data.scene);
		cornerSO.rotation = new BABYLON.Vector3(0, 2.4, 0);
		cornerSO.position = new BABYLON.Vector3(13.8, 4.5, -25.5)
		cornerSO.checkCollisions = true;
		var cornerNE = BABYLON.MeshBuilder.CreatePlane('cornerNE', {width:10, height: 3}, room.data.scene);
		cornerNE.rotation = new BABYLON.Vector3(0, -0.8, 0);
		cornerNE.position = new BABYLON.Vector3(-13.8, 4.5, 25.5);
		cornerNE.checkCollisions = true;
		var cornerNO = BABYLON.MeshBuilder.CreatePlane('cornerNO', {width:10, height: 3}, room.data.scene);
		cornerNO.rotation = new BABYLON.Vector3(0, -2.4, 0);
		cornerNO.position = new BABYLON.Vector3(-13.8, 4.5, -25.5)
		cornerNO.checkCollisions = true;

		if (room.data.mode === "special"){
			//resto
		}
	}


	initHandlers(room: {name:string; data: GameInfo}) {
		var ball = room.data.scene?.getMeshByName('ball')!;
		var board =  room.data.scene?.getMeshByName('board');
		var SE = room.data.scene?.getMeshByName('cornerSE');
		var SO = room.data.scene?.getMeshByName('cornerSO');
		var NO = room.data.scene?.getMeshByName('cornerNO');
		var NE = room.data.scene?.getMeshByName('cornerNE');
		// var racket1 = room.data.scene?.getMeshByName('player1');
		// var racket2 = room.data.scene?.getMeshByName('player2');
		var c1Middle = room.data.scene?.getMeshByName('c1Middle');
		var c1Top = room.data.scene?.getMeshByName('c1Top');
		var c1Bottom = room.data.scene?.getMeshByName('c1Bottom');
		var c2Top = room.data.scene?.getMeshByName('c2Top');
		var c2Middle = room.data.scene?.getMeshByName('c2Middle');
		var c2Bottom = room.data.scene?.getMeshByName('c2Bottom');
		const move = new BABYLON.Vector3(0, 0, 0.4);
		// Set up onCollide handler for the ball
		ball.onCollide = (collidedMesh) => {
			if (collidedMesh === board) {
				move.x *= -1;
			// } else if (collidedMesh === racket1 || collidedMesh === racket2) {
			// 					move.z *= -1;
			}else if (collidedMesh === c1Middle || collidedMesh === c2Middle
						|| collidedMesh === c1Bottom || collidedMesh === c2Bottom 
						|| collidedMesh === c1Top || collidedMesh === c2Top) {
				move.z *= -1;
				if (collidedMesh === c1Bottom || collidedMesh === c2Bottom)
					if (move.x == 0)
						move.x = 0.2;
					else
						move.x *= move.x > 0 ? 1 : -1;
				else if (collidedMesh === c1Top || collidedMesh === c2Top)
					if (move.x == 0)
						move.x = -0.2;
					else
						move.x *= move.x > 0 ? -1 : 1;
			} else if (collidedMesh === SE || collidedMesh === NO) {
				let newz = move.z * Math.cos(0.8) - move.x * Math.sin(0.8);
				let newx = -(move.z * Math.sin(0.8) + move.x * Math.cos(0.8))
				move.z = newz * Math.cos(0.8) + newx * Math.sin(0.8);
				move.x = newx * Math.cos(0.8) - newz * Math.sin(0.8);
			}
			else if (collidedMesh === NE || collidedMesh === SO){
				let newz = move.z * Math.cos(-0.8) - move.x * Math.sin(-0.8);
				let newx = -(move.z * Math.sin(-0.8) + move.x * Math.cos(-0.8))
				move.z = newz * Math.cos(-0.8) + newx * Math.sin(-0.8);
				move.x = newx * Math.cos(-0.8) - newz * Math.sin(-0.8);
			}
			this.server.to(room.name).emit('ball-update', move);
		};


		/* TO DO 
		spawn power up meglio gestito dal client
		=> invia segnale di spawn con posizione e tipo di power
		=> client gestisce collisione con power
		=> su collisione invia player-update se ottenuto da se stesso
		=> se preso da avversario cancella pallina e basta, aspetta player-update per aggiornare
		=> server aggiorna i propri mesh :: potrebbe rendere inutile il tutto visto che ha bisogno di avere gli effetti
		*/

		this.gameLoop(room, move);
	}

	gameLoop(room: {name: string; data: GameInfo}, move: BABYLON.Vector3) {
		// BABYLON.SceneOptimizer.OptimizeAsync(room.data.scene!);
		var ball = room.data.scene?.getMeshByName('ball')!;
		console.log(room.name);
		this.engine.runRenderLoop(() => {
			ball.moveWithCollisions(move);
			room.data.scene?.render();
			if (ball.position.z > 30 || ball.position.z < -30){
				ball.position.z > 30 ? room.data.score1++ : room.data.score2++;
				ball.position = new BABYLON.Vector3(0, 4.5, 0);
				this.server.to(room.name).emit('score-update', {score1: room.data.score1, score2: room.data.score2});
			}
			if (room.data.score1 >= 10 || room.data.score2 >= 10){
				room.data.winner = room.data.score1 >= 10 ? 1 : 2;
				let tempSock = room.data.player2;
				this.server.to(room.name).emit('finished', room.data.winner);
				room.data.player1.disconnect();
				tempSock.disconnect();
			}
		});
	}

	@SubscribeMessage('player-update')
	handlePower(client: Socket, power: Power){
		let room = this.findClientRoom(client)!;
			/*------------------------------------------*/
		var racket = room.data.scene?.getMeshByName(client === room.data.player1 ? 'player1': 'player2')!;
		/* TO DO 
		server avra' bisogno di um modo di applicare gli effetti
		rifare le classi o passargli la funzione
 		*/
	}

	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, direction: string): void {
		let room = this.findClientRoom(client)!;
		/*------------------------------------------*/
		var racket = room.data.scene?.getMeshByName(client === room.data.player1 ? 'player1': 'player2')!;
		switch (direction) {
			case 'up':
				racket.position.x -= 0.1;
				// racket.moveWithCollisions( new BABYLON.Vector3(-0.1, 0 , 0));
				break;
			case 'down':
				racket.position.x += 0.1;
				// racket.moveWithCollisions( new BABYLON.Vector3(0.1, 0 , 0));
				break;
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
	
}
  