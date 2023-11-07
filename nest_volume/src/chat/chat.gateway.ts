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
        console.log('\n\nInitialized!(chat)');
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        console.log(`\n\nClient connected(chat): ${client.id}`);
    }
    
    handleDisconnect(client: Socket) {
        console.log(`\n\nClient disconnected(chat): ${client.id}`);
    }
    
    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: any): string {
        return '\n\nHello world!(chat)';
    }

    @SubscribeMessage('BroadcastChannel')
    handleBroadcastChannel(client: any, payload: any): void {
      //send privmsg to all users of the channel
      //save the message on the db
      const message = 'ciao come va?';///debug
      this.server.emit('msgFromChannel', { message });
    }
}