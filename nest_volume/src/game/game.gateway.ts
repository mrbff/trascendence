import { Enlarge, Power, Speed, Shield } from './dto/power.dto';
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
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

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
	private normalQueue: {username: string, client: Socket}[] = [];
	private specialQueue: {username: string, client: Socket}[] = [];
	private rooms: {name: string; data: GameInfo}[] = [];
	private engine!: BABYLON.Engine;
	private playersReady: Set<string> = new Set(); // Set to track players who have sent the "start" signal

	//---------------------- CONNECTION HANDLING -------------------------//

	constructor(private prisma: PrismaService, private userData: UsersService){}

	afterInit(server: Server) {
	  console.log('\n\nInitialized!(pong)');
	  server.on('error', (error) => {
		console.error('Socket.IO error:', error);
	  });
	}
  
	handleConnection(client: Socket) {
		let element = {username: client.handshake.query.name as string, client: client}
		if (client.handshake.query.gameMode === "normal"){
			this.normalQueue.push(element);
			this.matchmake(this.normalQueue, "normal");
		}
		else{
			this.specialQueue.push(element);
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
				if (room.data.mode === 'special')
				clearInterval(room.data.timer);
				if (room.data.winner == -1){
					let other = room.data.player1 === client ? room.data.player2 : room.data.player1;
					other.emit('opp-disconnect');
				}
				else
					this.createMatchHistory(room);
				this.rooms.splice(this.rooms.indexOf(room), 1);
			}
			break;
		}
	}

	private removeFromQueue(client: Socket) {
		if (this.normalQueue.find((elem) => elem.client.id == client.id))
			this.normalQueue = this.normalQueue.filter((elem) => elem.client.id !== client.id);
		else
			this.specialQueue = this.specialQueue.filter((elem) => elem.client.id !== client.id);
	}

 	private async matchmake(queue: {username: string, client: Socket}[], mode: string) {
		if (queue.length >= 2) {
			const player1 = queue[0];
			const player2 = queue[1];
			queue.pop();
			queue.pop();
			// Create a room for the matched players
			let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
			player1?.client.join(roomName);
			player2?.client.join(roomName);
			let user1 = await this.userData.findUserByName(player1.username);
			let user2 = await this.userData.findUserByName(player2.username);
			let size = this.rooms.push({name: roomName, data: {player1: player1.client, id1: user1.id, player2: player2.client, id2: user2.id, score1: 0, score2: 0, winner: -1, mode: mode}});
			// Notify players about the match
			console.log(`\n\nMatch found! Players ${player1?.client.id} and ${player2?.client.id} are in room ${roomName}`);
			// console.log(this.rooms.length);
			player1?.client.emit('opponent-found', {user: player2.client.id, username: player2.username, seat: 1});
			player2?.client.emit('opponent-found', {user: player1.client.id, username: player1.username, seat: 2});
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
		ball.metadata = {last_hit: -1};

        // Create the main capsule mesh
        var racket1 = BABYLON.MeshBuilder.CreateCapsule('player1', { height: 7, radius: 0.5 }, room.data.scene);
        racket1.position = new BABYLON.Vector3(0, 4.5, -29);
        racket1.rotation = new BABYLON.Vector3(0, 0, 1.57);

        // Create the bottom collider
        var c1Bottom = BABYLON.MeshBuilder.CreatePlane('c1Bottom', {height: 2.2, sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Bottom.position = new BABYLON.Vector3(0, -2.2, 0.55); // Adjust the position of the bottom collider
        c1Bottom.parent = racket1; // Make it a child of the main mesh
        c1Bottom.checkCollisions = true;

        // Create the middle collider
        var c1Middle = BABYLON.MeshBuilder.CreatePlane('c1Middle', {height: 2.2,sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Middle.position = new BABYLON.Vector3(0, 0, 0.55); // Adjust the position of the middle collider
        c1Middle.parent = racket1; // Make it a child of the main mesh
        c1Middle.checkCollisions = true;

        // Create the top collider
        var c1Top = BABYLON.MeshBuilder.CreatePlane('c1Top', {height: 2.2,sideOrientation: BABYLON.Mesh.BACKSIDE}, room.data.scene);
        c1Top.position = new BABYLON.Vector3(0, 2.25, 0.55); // Adjust the position of the top collider
        c1Top.parent = racket1; // Make it a child of the main mesh
        c1Top.checkCollisions = true;


        var racket2 = BABYLON.MeshBuilder.CreateCapsule('player2', { height: 7, radius: 0.5 }, room.data.scene);
        racket2.position = new BABYLON.Vector3(0, 4.5, 29);
        racket2.rotation = new BABYLON.Vector3(0, 0, 1.57);

        // Create the bottom collider
        var c2Bottom = BABYLON.MeshBuilder.CreatePlane('c2Bottom', {height: 2.2}, room.data.scene);
        c2Bottom.position = new BABYLON.Vector3(0, -2.25, -0.55); // Adjust the position of the bottom collider
        c2Bottom.parent = racket2; // Make it a child of the main mesh
        c2Bottom.checkCollisions = true;
        // Create the middle collider
        var c2Middle = BABYLON.MeshBuilder.CreatePlane('c2Middle', {height: 2.2}, room.data.scene);
        c2Middle.position = new BABYLON.Vector3(0, 0, -0.55); // Adjust the position of the middle collider
        c2Middle.parent = racket2; // Make it a child of the main mesh
        c2Middle.checkCollisions = true;
        // Create the top collider
        var c2Top = BABYLON.MeshBuilder.CreatePlane('c2Top', {height: 2.2}, room.data.scene);
        c2Top.position = new BABYLON.Vector3(0, 2.25, -0.55); // Adjust the position of the top collider
        c2Top.parent = racket2; // Make it a child of the main mesh
        c2Top.checkCollisions = true;

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

			var shield1 = BABYLON.MeshBuilder.CreateCylinder('shield1', {height: 34, diameter: 2.5})
			shield1.position = new BABYLON.Vector3(0, 4.5, -24);
			shield1.rotation = new BABYLON.Vector3(0, 0 , 1.57);
			racket1.metadata = {speed: 1, shield: shield1};

			var shield2 = BABYLON.MeshBuilder.CreateCylinder('shield2', {height: 34, diameter: 2.5})
			shield2.position = new BABYLON.Vector3(0, 4.5, 24);
			shield2.rotation = new BABYLON.Vector3(0, 0 , 1.57);
			racket2.metadata = {speed: 1, shield: shield2};

		}
	}


	initHandlers(room: {name:string; data: GameInfo}) {
		var ball = room.data.scene?.getMeshByName('ball')!;
		var board =  room.data.scene?.getMeshByName('board');
		var SE = room.data.scene?.getMeshByName('cornerSE');
		var SO = room.data.scene?.getMeshByName('cornerSO');
		var NO = room.data.scene?.getMeshByName('cornerNO');
		var NE = room.data.scene?.getMeshByName('cornerNE');
		var c1Middle = room.data.scene?.getMeshByName('c1Middle');
		var c1Top = room.data.scene?.getMeshByName('c1Top');
		var c1Bottom = room.data.scene?.getMeshByName('c1Bottom');
		var c2Top = room.data.scene?.getMeshByName('c2Top');
		var c2Middle = room.data.scene?.getMeshByName('c2Middle');
		var c2Bottom = room.data.scene?.getMeshByName('c2Bottom');
		var move = new BABYLON.Vector3(0, 0, 0.9);
		// Set up onCollide handler for the ball
		ball.onCollide = (collidedMesh) => {
			if (collidedMesh === board) {
				move.x *= -1;
			}
			else if (collidedMesh === c1Middle || collidedMesh === c2Middle
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
				if (collidedMesh === c1Middle || collidedMesh === c1Bottom || collidedMesh === c1Top)
					ball.metadata.last_hit = 1;
				else
					ball.metadata.last_hit = 2;
			}
			else if (collidedMesh === SE || collidedMesh === NO) {
				let newz = move.z * Math.cos(0.7) - move.x * Math.sin(0.7);
				let newx = -(move.z * Math.sin(0.7) + move.x * Math.cos(0.7))
				move.z = newz * Math.cos(0.7) + newx * Math.sin(0.7);
				move.x = newx * Math.cos(0.7) - newz * Math.sin(0.7);
			}
			else if (collidedMesh === NE || collidedMesh === SO){
				let newz = move.z * Math.cos(-0.7) - move.x * Math.sin(-0.7);
				let newx = -(move.z * Math.sin(-0.7) + move.x * Math.cos(-0.7))
				move.z = newz * Math.cos(-0.7) + newx * Math.sin(-0.7);
				move.x = newx * Math.cos(-0.7) - newz * Math.sin(-0.7);
			}
			else
				move.z *= -1;
			this.server.to(room.name).emit("ball-collide");
		};
		if (room.data.mode === "special")
			room.data.timer = setInterval(() =>{
				var location = new BABYLON.Vector3(24 * Math.random() - 12, 20, 40 * Math.random() - 20);
				var power = this.getRandomPower();
				this.server.to(room.name).emit("power-update",{position: location, power: power});
			}, 30000);
		this.server.to(room.name).emit('start');
		this.gameLoop(room, move);
	}

	gameLoop(room: {name: string; data: GameInfo;}, move: BABYLON.Vector3) {
		var ball = room.data.scene?.getMeshByName('ball')!;
		this.engine.runRenderLoop(() => {
			ball.moveWithCollisions(move);
			room.data.scene?.render();
			if (ball.position.z > 32 || ball.position.z < -32){
				ball.position.z > 32 ? room.data.score1++ : room.data.score2++;
				ball.position = new BABYLON.Vector3(0, 4.5, 0);
				move.x = 0;
				move.z *= -1;
				this.server.to(room.name).emit('score-update', {score1: room.data.score1, score2: room.data.score2});
			}
			if (room.data.score1 >= 10 || room.data.score2 >= 10){
				room.data.winner = room.data.score1 >= 10 ? 1 : 2;
				let tempSock = room.data.player2;
				this.server.to(room.name).emit('finished', room.data.winner);
				room.data.player1.disconnect();
				tempSock.disconnect();
			}
			this.server.to(room.name).emit('ball-update', {move:move, lastPlayer: ball.metadata?.last_hit || undefined});
		});
	}

	@SubscribeMessage('player-update')
	handlePower(client: Socket, power: Power){
		let room = this.findClientRoom(client)!;
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
		var racket = room.data.scene?.getMeshByName(client === room.data.player1 ? 'player1': 'player2')!;
		pcopy.effect(racket);
		client.to(room.name).emit('player-update', power);
	}

	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, direction: string): void {
		let room = this.findClientRoom(client)!;
		var racket = room.data.scene?.getMeshByName(client === room.data.player1 ? 'player1': 'player2')!;
		const speed = racket.metadata?.speed || 1;
		switch (direction) {
			case 'up':
				racket.position.x -= 0.1 * speed;
				break;
			case 'down':
				racket.position.x += 0.1 * speed;
				break;
		}
		racket.getChildMeshes().forEach((value)=> {value.refreshBoundingInfo()});
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
		var room = this.rooms.find((r) => r.name === roomName);
		if (!room) {
			console.error(`Room not found for client ${client.id}`);
			return;
		}
		return (room);
	}
	
	getRandomPower(): string {
		const powerClasses = ['Enlarge', 'Speed', 'Shield'];
		const randomIndex = Math.floor(Math.random() * 3);
		return powerClasses[randomIndex];
	}
	
	async createMatchHistory(room: {name: string; data: GameInfo;}) {
		try {
		  const matchHistoryEntry = await this.prisma.matchHistory.create({
			data: {
			  User1Id: room.data.id1.toString(),
			  User2Id: room.data.id2.toString(),
			  winner: room.data.winner === 1 ? room.data.id1.toString() : room.data.id2.toString(),
			  score: room.data.score1 + ' - ' + room.data.score2,
			  mode: room.data.mode === 'normal' ? 'CLASSIC' : 'CYBERPUNK'
			}
		  });
	  
		  console.log('Match history entry created:', matchHistoryEntry);
		} catch (error) {
		  console.error('Error creating match history entry:', error);
		}
	}
}
  