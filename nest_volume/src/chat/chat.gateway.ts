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
    
    @SubscribeMessage('PrivMsg')
    handlePriv(client: Socket, payload: {sender: string, receiver: string, message: string}): void {
      const {sender, receiver, message} = payload;
      this.server.emit('MsgFromChannel', { sender:sender, message:message });
    }

    @SubscribeMessage('ChannelMsg')
    handleChannelMsg(client: Socket, payload: {sender: string, channel: string, message: string}): void {
      /* TO DO: send privmsg to all users of the channel,
      save the message on the db */
      const {sender, channel, message} = payload;
      this.server.emit('MsgFromChannel', { sender:sender, channel:channel, message:message });
    }
}