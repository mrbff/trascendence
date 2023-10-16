import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RedirectionGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('messageRequest')
  handleMessage(client: any, payload: any): void {
    const message = process.env.FT_API_URL as string;
    this.server.emit('textMessage', { message });
  }
}
