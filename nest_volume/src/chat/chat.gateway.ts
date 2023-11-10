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

interface ExtendedSocket extends Socket {
  user: any;
}

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
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('\n\nInitialized!(chat)');
  }

  async handleConnection(client: ExtendedSocket, ...args: any[]) {
    console.log(`\n\nClient connected(chat): ${client.id}`);

    const token = await client.handshake.query.token as string;
    console.log(`\n\njwt ${token}`);
/*
    try {
      const userId = await verifyToken(token as string);
      console.log(`\nwerho  ${userId}\n`);
    /*  const user = await this.usersService.findOne(userId);
      client.user = user;
      userSocketMap[user.id] = client.id;*/
  /*  } catch (err) {
    //  client.disconnect();
    }*/
  }

  handleDisconnect(client: ExtendedSocket) {
    console.log(`\n\nClient disconnected(chat): ${client.id}`);
    if (client.user && client.user.id) {
      delete userSocketMap[client.user.id];
    }
  }

  @SubscribeMessage('PrivMsg')
  handlePriv(client: Socket, payload: { sender: string, receiver: string, message: string }): void {
    const { sender, receiver, message } = payload;
    this.server.emit('MsgFromChannel', { sender: sender, message: message });
  }

  @SubscribeMessage('ChannelMsg')
  handleChannelMsg(client: Socket, payload: { sender: string, channel: string, message: string }): void {
    const { sender, channel, message } = payload;
    this.server.emit('MsgFromChannel', { sender: sender, channel: channel, message: message });
  }
}
/*
async function verifyToken(token: string) {
  const secretKey = environment.jwt_secret as string;

  try {
      // Verify the token
      const decoded = await jwt.verify(token, this.jwtSecret);

      // Check if the id is present in the payload
      if (decoded && typeof decoded === 'object' && 'id' in decoded) {
          console.log(`www ${decoded.id}`);
      } else {
          throw new Error('Invalid token payload');
      }
  } catch (error) {
      // Handle any error that might occur during verification
      throw new Error('Invalid or expired token');
  }
}*/