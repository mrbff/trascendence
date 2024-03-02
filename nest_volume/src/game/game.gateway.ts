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
	private normalQueue: {username: string, id: string, client: Socket}[] = [];
	private specialQueue: {username: string, id: string, client: Socket}[] = [];
	private rooms: {name: string; data: GameInfo}[] = [];
	private engine!: BABYLON.Engine;

	//---------------------- CONNECTION HANDLING -------------------------//

	constructor(private prisma: PrismaService, private userData: UsersService){}

	afterInit(server: Server) {
	  //console.log('\n\nInitialized!(pong)');
	  server.on('error', (error) => {
		console.error('Socket.IO error:', error);
	  });
	}
  
	async handleConnection(client: Socket) {
		//console.log(`\n\nClient connected(pong): ${client.id}`);
		let query = client.handshake.query
		if (!query.name || !query.id){
			client.emit("connection-status", false);
			client.disconnect();
			return;
		}
		client.emit("connection-status", true);
		//console.log("QUERY => ", query);
		let element = {username: query.name as string, id:query.id as string, client: client}
		for (var room of this.rooms)
		{
			if (room.data.id1.toString() === element.id){
				room.data.player1 = client;
				client.join(room.name);
				return
			} else if (room.data.id2.toString() === element.id){
				room.data.player2 = client;
				client.join(room.name);
				return
			}
		}
		if (query.invited != 'undefined')
			this.inviteSetup(element);
		else{
			if (query.gameMode === "normal"){
				this.normalQueue.push(element);
				this.matchmake(this.normalQueue, "normal");
			}
			else{
				this.specialQueue.push(element);
				this.matchmake(this.specialQueue, "special");
			}
		}
	}

	async handleDisconnect(client: Socket) {
		//console.log(`\n\nClient disconnected(pong): ${client.id}`);
		this.removeFromQueue(client);
		for (var room of this.rooms)
		{
			if (room.data.player1 === client || room.data.player2 === client){
				this.rooms.splice(this.rooms.indexOf(room), 1);
				if (room.data.scene)
					room.data.scene?.dispose();
				if (room.data.mode === 'special')
					clearInterval(room.data.timer);
				if (room.data.winner == -1){
					if (room.data.player1 === client){
						room.data.player2.emit('opp-disconnect');
						room.data.player2.disconnect()
						if (room.data.inviteGame) {
							try {
								await this.prisma.gameinvite.delete({
									where: {
										id: parseInt(room.data.inviteGame),
									},
								});
							} catch (error) {
								console.error('Invite already deleted:');
							}
						}
						if (room.data.id1 != -1 && room.data.id2 != -1){
							let matchID =  await this.createMatchHistory(room, client);
							this.userData.updateWinLoss(room.data.id1, {res: "Lost", matchId: matchID})
							this.userData.updateWinLoss(room.data.id2, {res: "Won", matchId: matchID})
							this.userData.updateIsPlaying(room.data.id1, false);
						}
						console.log(`\n\nClient disconnected(pong1): ${client.id}`);
					} 
					else {
						room.data.player1.emit('opp-disconnect');
						room.data.player1.disconnect();
						if (room.data.inviteGame) {
							try {
								await this.prisma.gameinvite.deleteMany({
									where: {
										id: parseInt(room.data.inviteGame),
									},
								});
							} catch (error) {
								console.error('Invite already deleted:');
							}
						}
						if (room.data.id1 != -1 && room.data.id2 != -1){
							let matchID =  await this.createMatchHistory(room, client);
							this.userData.updateWinLoss(room.data.id2, {res: "Lost", matchId: matchID})
							this.userData.updateWinLoss(room.data.id1, {res: "Won", matchId: matchID})
							this.userData.updateIsPlaying(room.data.id2, false);
						}
						console.log(`\n\nClient disconnected(pong2): ${client.id}`);
					}
				}
			}
		}
	}

	async inviteSetup(user: {username: string, id: string, client: Socket}){
		let room = this.rooms.find((room: {name: string, data: GameInfo}) =>{
			return room.data.inviteGame == user.client.handshake.query.invited
		});
		if (room){
			//console.log("INV");
			user.client.join(room.name);
			room.data.id1 = parseInt(user.id);
			room.data.player1 = user.client;
			user.client.emit('opponent-found', {username: (await this.userData.findOne(room.data.id2)).username, seat: 1});
			room.data.player2.emit('opponent-found', {username: (await this.userData.findOne(room.data.id1)).username, seat: 2});
			clearTimeout(room.data.deleteTimer);
		}
		else{
			let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
			room = {
				name: roomName,
				data: {
					player1: user.client,
					id1: -1,
					player2: user.client,
					id2: parseInt(user.id),
					score1: 0,
					score2: 0,
					winner: -1,
					mode: user.client.handshake.query.gameMode as string,
					playersReady: new Set(),
					inviteGame: user.client.handshake.query.invited,
				} as GameInfo};
			this.rooms.push(room);
			room.data.deleteTimer = setTimeout(() => {
				this.rooms.splice(this.rooms.indexOf(room!), 1);
				room!.data.player2.emit("invite-expired");
				room!.data.player2.disconnect();
			}, 10000);
			user.client.join(roomName);
		}
	}



	private removeFromQueue(client: Socket) {
		if (this.normalQueue.find((elem) => elem.client.id == client.id))
			this.normalQueue = this.normalQueue.filter((elem) => elem.client.id !== client.id);
		else
			this.specialQueue = this.specialQueue.filter((elem) => elem.client.id !== client.id);
	}

 	private matchmake(queue: {username: string, id: string, client: Socket}[], mode: string) {
		//console.log("QUEUE => ", queue);
		if (queue.length >= 2) {
			const player1 = queue[0];
			const player2 = queue[1];
			queue.pop();
			queue.pop();
			let roomName = `room_${Math.random().toString(36).substring(2, 8)}`;
			player1?.client.join(roomName);
			player2?.client.join(roomName);
			this.rooms.push({
				name: roomName,
				data: {
					player1: player1.client,
					id1: parseInt(player1.id),
					player2: player2.client,
					id2: parseInt(player2.id),
					score1: 0,
					score2: 0,
					winner: -1,
					mode: mode,
					playersReady: new Set(),
					inviteGame: null
				}});
			//console.log(`\n\nMatch found! Players ${player1?.client.id} and ${player2?.client.id} are in room ${roomName}`);
			player1?.client.emit('opponent-found', {username: player2.username, seat: 1});
			player2?.client.emit('opponent-found', {username: player1.username, seat: 2});
		}
	}
	
	@SubscribeMessage('start')
	start(client: Socket) {
	  let room = this.findClientRoom(client);
	  if (room) {
		//console.log(`player ${client.id} ready`);
		room.data.playersReady.add(client.id);
		if (room.data.playersReady.size === 2) {
			room.data.playersReady.clear();
			if (!room.data.scene) {
			  this.createScene(room);
			  room.data.scene!.executeWhenReady(() => this.initHandlers(room!));
			}
		}
	  }
	}

	//---------------------- GAME LOGIC -------------------------//
	
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

		const data = fs.readFileSync('/usr/src/app/src/game/assets/edit2.glb');
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
						move.x = 0.4;
					else
						move.x *= move.x > 0 ? 1 : -1;
				else if (collidedMesh === c1Top || collidedMesh === c2Top)
					if (move.x == 0)
						move.x = -0.4;
					else
						move.x *= move.x > 0 ? -1 : 1;
				if (collidedMesh === c1Middle || collidedMesh === c1Bottom || collidedMesh === c1Top)
					ball.metadata.last_hit = 1;
				else
					ball.metadata.last_hit = 2;
			}
			else if (collidedMesh === SE || collidedMesh === NO) {
				let newz = move.z * Math.cos(0.9) - move.x * Math.sin(0.9);
				let newx = -(move.z * Math.sin(0.9) + move.x * Math.cos(0.9))
				move.z = newz * Math.cos(0.9) + newx * Math.sin(0.9);
				move.x = newx * Math.cos(0.9) - newz * Math.sin(0.9);
			}
			else if (collidedMesh === NE || collidedMesh === SO){
				let newz = move.z * Math.cos(-0.9) - move.x * Math.sin(-0.9);
				let newx = -(move.z * Math.sin(-0.9) + move.x * Math.cos(-0.9))
				move.z = newz * Math.cos(-0.9) + newx * Math.sin(-0.9);
				move.x = newx * Math.cos(-0.9) - newz * Math.sin(-0.9);
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
		room.data.scene?.onBeforeRenderObservable.add( async () => {
			ball.moveWithCollisions(move);
			if (ball.position.z > 32 || ball.position.z < -32){
				ball.position.z > 32 ? room.data.score1++ : room.data.score2++;
				ball.position = new BABYLON.Vector3(0, 4.5, 0);
				move.x = 0;
				move.z = move.z > 0 ? -0.9 : 0.9;
				this.server.to(room.name).emit('score-update', {score1: room.data.score1, score2: room.data.score2});
			}
			if (room.data.score1 >= 10 || room.data.score2 >= 10){
				room.data.winner = room.data.score1 >= 10 ? 1 : 2;
				let tempSock = room.data.player2;
				let matchId = await this.createMatchHistory(room, undefined);
				if (room.data.inviteGame) {
					try {
						this.prisma.gameinvite.deleteMany({
							where: {
							OR: [
								{ senderId: room.data.id1, receiverId: room.data.id2 },
								{ senderId: room.data.id2, receiverId: room.data.id1 },
							],
							},
						});
					} catch (error) {
						console.error('Invite already deleted:');
					}
				}
				this.server.to(room.name).emit('finished', {winner: room.data.winner, matchId: matchId});
				room.data.player1.disconnect();
				tempSock.disconnect();
			}
			this.server.to(room.name).emit('ball-update', {move:move, lastPlayer: ball.metadata?.last_hit || undefined});
		});
		room.data.renderFunction = this.engine.runRenderLoop(() => {
			room.data.scene?.render();
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
				racket.position.x -= 0.3 * speed;
				break;
			case 'down':
				racket.position.x += 0.3 * speed;
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
	
	async createMatchHistory(room: {name: string; data: GameInfo;}, disconnected: Socket | undefined) : Promise<number>  {
		try {
			if (room.data.winner === -1){
				room.data.winner = disconnected == room.data.player1 ? room.data.id2 : room.data.id1;
			}
			const matchHistoryEntry = await this.prisma.matchHistory.create({
				data: {
					User1Id: room.data.id1.toString(),
					User2Id: room.data.id2.toString(),
					winner: room.data.winner === 1 ? room.data.id1.toString() : room.data.id2.toString(),
					score: room.data.score1 + ' - ' + room.data.score2,
					mode: room.data.mode === 'normal' ? 'CLASSIC' : 'CYBERPUNK'
				}
			});
			return(matchHistoryEntry.id);
		} catch (error) {
		  console.error('Error creating match history entry:', error);
		  return(-1);
		}
	}
}
  