import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { environment } from 'src/environment/environment';

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
    const message = environment.ft_api_url;
    this.server.emit('textMessage', { message });
  }
}
