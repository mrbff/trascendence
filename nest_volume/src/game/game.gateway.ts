import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { GameInfo, START_GAME_DATA } from './dto/gameInfo.dto';
  
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
			let size = this.rooms.push({name: roomName, data: START_GAME_DATA});
			this.rooms[size - 1].data.player.player = player1.id;
			this.rooms[size - 1].data.opponent.player = player2.id;
			// Notify players about the match
			console.log(`\n\nMatch found! Players ${player1?.id} and ${player2?.id} are in room ${roomName}`);
			player1?.emit('opponent-found', {user: player2.id, connected: true});
			player2?.emit('opponent-found', {user: player1.id, connected: true});
		}
	}

	@SubscribeMessage('moveRacket')
	handleMoveRacket(client: Socket, direction: string): void {
		const roomNames = Array.from(client.rooms.values()).filter((room) => room !== client.id);
		if (roomNames.length === 0) {
			console.error(`Client ${client.id} is not in any room.`);
			return;
		}
		const roomName = roomNames[0]; 
		console.log(roomName);
		var room = this.rooms.find((r) => r.name === roomName);
		if (!room) {
			console.error(`Room not found for client ${client.id}`);
			return;
		}
		console.log(direction);
		if (direction === "up"){
			if (client.id === room.data.player.player)
				room.data.p0Y -= room.data.player.speed;
			else
				room.data.p1Y -= room.data.opponent.speed;
		}
		else if (direction === "down"){
			if (client.id === room.data.player.player)
				room.data.p0Y += room.data.player.speed;
			else
				room.data.p1Y += room.data.opponent.speed;
		}
		this.server.emit('game-update', room.data);
	}
  
	@SubscribeMessage('game-connect')
	handleGameConnect(client: Socket, user: { id: string; name: string }): void {
	  // Handle the game-connect event here
	  // Example: You can log the connected user or perform other actions
	  client.join(user.id);

	  console.log(`\n\n${user.name} connected to the game`);
	}
}
  