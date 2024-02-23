import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

const userSocketMap: { [userId: string]: ExtendedSocket } = {};

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
      userSocketMap[user.username] = client;
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

  @SubscribeMessage('DeleteAllChannels')
  async deleteAllChannels(client: Socket) {
    await this.channelsService.deleteAllChannels();
  }

  @SubscribeMessage('DeleteChannel')
  async deleteChannel(client: Socket, payload: { channelId: string }) {
    const { channelId } = payload;
    await this.channelsService.rmChannel(channelId);
  }

  @SubscribeMessage('Authenticate')
  authentcate(client: Socket, payload: { token: string }): void {
    const { token } = payload;
    this.server.emit('Authenticate', { token });
  }

  @SubscribeMessage("GetChannelId")
  async getChannelId(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const channel = await this.channelsService.getChannelById(id);
    client.emit('ChannelId', {channelId: channel?.id} );
  }

  @SubscribeMessage("GetChannelById")
  async getChannelById(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const channel = await this.channelsService.getChannelById(id);
    client.emit('Channel', {channel} );
  }

  @SubscribeMessage("AddUserToChannel")
  async addUserToChannel(client: Socket, payload: { channelId: string, username: string}) {
    const { channelId, username } = payload;
    const channel = await this.channelsService.addUsersToChannel(channelId, username); 
    this.receiveUserChannels(client, {username});
  }

  @SubscribeMessage("ReceiveUserList")
  async reciveUserList(client: Socket, payload: { id: string }) {
    const { id } = payload;
    const channels = await this.channelsService.getChannelById(id);
    const userlist: any = channels?.members?.map((member: any) => {
      return {
        username: member.user.usename,
        role: member.role
      };
    });
    for (let user of channels?.members ?? []) {
      const receiver = user.user.id;
      userSocketMap[receiver].emit('ReceiveUserList', { userlist });
    }
  }

  @SubscribeMessage("SetOwner")
  async setOwner(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.setOwner(id, username);
  }

  @SubscribeMessage("SetAdmin")
  async setAdmin(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.setAdmin(id, username);
  }

  @SubscribeMessage("RemoveAdmin")
  async removeAdmin(client: Socket, payload: { id: string, username: string}) {
    const { id, username } = payload;
    await this.channelsService.rmAdmin(id, username);
  }

  @SubscribeMessage("GetLastSeen")
  async getLastSeen(client: Socket, payload: { channelId: string}) {
    const { channelId } = payload;
    const lastSeen = await this.channelsService.getLastSeen(channelId);
    client.emit('LastSeen', lastSeen);
  }
  
  @SubscribeMessage("ReceiveUserChannels")
  async receiveUserChannels(client: Socket, payload: { username: string }) {
    const channels = (await this.channelsService.getUserChannels(payload.username))?.sort((c1, c2)=>c1.name?.localeCompare(c2?.name ?? "") ?? 0);
    const user = this.usersService.findUserByName(payload.username);
    try {
      userSocketMap[(await user).username].emit('UserChannelList', {channels} );
    } catch (error) {
      console.log("User offline");
    }
  }

  @SubscribeMessage('CreateNewChannel')
  async createNewChannel(client: Socket, payload: { channelName: string, users: string[], creator: string, groupType: string, password: string }) {
    const { channelName, users, creator, groupType, password } = payload;
    const newChannel = await this.channelsService.createNewChannel(channelName, users, creator, groupType, password);
    this.server.emit('CreatedNewPublicChannel', {channel: {...newChannel, isGroup:true}});
  }

  @SubscribeMessage('ChangePassword')
  async changePassword(client: Socket, payload: { id: string, password: string, channelType: string }) {
    const { id, password, channelType } = payload;
    await this.channelsService.changePassword(id, password, channelType);
  }

  @SubscribeMessage('ChannelMsg')
  async handleChannelMsg(client: Socket, payload: { sender: string, channel: string, message: string }) {
    const { sender, channel, message } = payload;
    const { channelId } = await this.channelsService.createChannelMessage(channel, message, sender);
    const ch = await this.channelsService.getChannelById(channelId);
    ch?.members?.map((member: any) => {
      if (member.status === 'ACTIVE') {
        try {
          userSocketMap[member.user.username].emit('MsgFromChannel', [{ user: sender,  msg: message, channelId }]);
        } catch (error) {
          console.log(`cant invite: ${member.user.username} is offline`);
        }
      }
    });
  }

  @SubscribeMessage('InviteMsg')
  async handleInviteMsg(client: Socket, payload: { channelId: string, sender: string, username: string, invId: string }) {
    const { channelId, sender, username } = payload;
    try {
      const ids = await this.channelsService.createGameInvite(username, sender)
      payload.invId = payload.invId + ":" + ids;
      const {id} = await this.channelsService.createInviteChannelMessage(channelId, payload.invId, sender);
      setTimeout(() => {this.channelsService.updateInviteStatus(channelId, id, sender, username)}, 1000 * 10);
      const ch = await this.channelsService.getChannelById(channelId);
      ch?.members?.map((member: any) => {
        if (member.status === 'ACTIVE' || (member.user.username === username)) {
          try {
            userSocketMap[member.user.username].emit('MsgFromChannel', [{ id: id, user: sender,  msg: payload.invId, channelId: ch.id, from: sender, isInvite: "PENDING", channelName: ch.name, time: new Date().toISOString()}]);
          } catch (error) {
            console.log(`cant invite: ${member.user.username} is offline`);
          }
        }
        }
      );
    } catch (error) {
      console.log(`invite allready sent to ${username}`);
    }
  }

  @SubscribeMessage('ChannelModMsg')
  async handleModChannelMsg(client: Socket, payload: { sender: string, channel: string, message: string, username: string, status: string | null}) {
    const { sender, channel, message, username, status } = payload;
    const { channelId } = await this.channelsService.createModChannelMessage(channel, message, sender);
    await this.channelsService.changeUserStatus(channelId, username, status);
    const ch = await this.channelsService.getChannelById(channelId);
    ch?.members?.map((member: any) => {
      if (member.status === 'ACTIVE' || (member.user.username === username)) {
        try {
          userSocketMap[member.user.username].emit('MsgFromChannel', [{ user: sender,  msg: message, channelId, isModer: true}]);
        } catch (error) {
          console.log(`cant invite: ${member.user.username} is offline`);
        }
      }
    });
    if (status !== null && (status === 'KICKED' || status === 'LEAVED')) {
      this.channelsService.rmUserFromChannel(channelId, username);
    }
  }

  @SubscribeMessage('LastSeen')
  async handleLastSeen(client: Socket, payload: { channelId: string, user: string }) {
    const { channelId, user } = payload;
    await this.channelsService.flagLastMessage(channelId, user);
  }

  @SubscribeMessage('ChangeUserStatus')
  async handleChangeUserStatus(client: Socket, payload: { channelId: string, username: string, status: string | null}) {
    const { channelId, username, status } = payload;
    await this.channelsService.changeUserStatus(channelId, username, status);
  }

  @SubscribeMessage('MuteUser')
  async handleMuteUser(client: Socket, payload: { id: string, username: string }) {
    const { id, username } = payload;
    await this.channelsService.muteUser(id, username);
  }

  @SubscribeMessage('UnMuteUser')
  async handleUnMuteUser(client: Socket, payload: { id: string, username: string }) {
    const { id, username } = payload;
    await this.channelsService.unMuteUser(id, username);
  }

  @SubscribeMessage('ReceiveChMsg')
  async receiveChannelMsg(client: Socket, payload: { id: string}) {
    const { id } = payload;
    const messages = await this.channelsService.getChannelMsgById(id);
    client.emit('ReceiveMsgForChannel', messages.map(message=>{
        return {
          id: message.id,
          msg:message.content,
          user:message.sender.username,
          time:message.time,
          isModer:message.isModer,
          isInvite: message.isInvite
        }
      })
    );
  }
}