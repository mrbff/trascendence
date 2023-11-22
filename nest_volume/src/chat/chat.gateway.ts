import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { environment } from 'src/environment/environment';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';

import {JwtPayload} from 'jsonwebtoken'
import { ChannelsService } from 'src/channels/channels.service';
type MyJwtPayload = {
  userId: number,
} & JwtPayload;

interface ExtendedSocket extends Socket {
  user: any;
}

type Message = {
  msg:string,
  user:any
};

const userSocketMap: { [userId: string]: string } = {};

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor (
    private usersService: UsersService,
    private channelsService: ChannelsService
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('\n\nInitialized!(chat)');
  }

  async handleConnection(client: ExtendedSocket, ...args: any[]) {
    console.log(`\n\nClient connected(chat): ${client.id}`);

    const token = client.handshake.auth.token;
    
    const secret = environment.jwt_secret as string;
    
    try {
      if (!token) throw Error;
      const decoded = jwt.verify(token, secret) as MyJwtPayload;
      const userId = decoded.userId;

      const user = await this.usersService.findOne(userId);
      client.user = user;
      userSocketMap[user.id] = client.id;
    } catch (error) {
      console.log('Authentication error');
      client.disconnect();
    }
  }

  handleDisconnect(client: ExtendedSocket) {
    console.log(`\n\nClient disconnected(chat): ${client.id}`);
    if (client.user && client.user.id) {
      delete userSocketMap[client.user.id];
    }
  }

  @SubscribeMessage('Authenticate')
  authentcate(client: Socket, payload: { token: string }): void {
    const { token } = payload;
    this.server.emit('Authenticate', { token });
  }

  @SubscribeMessage('PrivMsg')
  handlePriv(client: Socket, payload: { sender: string, receiver: string, message: string }): void {
    const { sender, receiver, message } = payload;
    this.channelsService.createDirectMessage(receiver, message, sender);
    this.server.emit('MsgFromChannel', { sender: sender, message: message });
  }

  @SubscribeMessage('ChannelMsg')
  handleChannelMsg(client: Socket, payload: { sender: string, channel: string, message: string }): void {
    const { sender, channel, message } = payload;
    this.channelsService.createChannelMessage(channel, message, sender);
    ///TO DO: creare room a cui mandarlo
    this.server.emit('MsgFromChannel', { sender: sender, channel: channel, message: message });
  }
}