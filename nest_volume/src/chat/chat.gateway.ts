import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    namespace: '/chat',
    cors: {
      origin: '*',
      credentials: true,
    },
  })
  export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    afterInit(server: Server) {
        console.log('Initialized!');
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }
    
    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }
    
    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: any): string {
        return 'Hello world!';
    }

    @SubscribeMessage('BroadcastChannel')
    handleBroadcastChannel(client: Socket, payload: any): boolean {
      //send privmsg to all users of the channel
      //save the message on the db
      return true;
    }
}