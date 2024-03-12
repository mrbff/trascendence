import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { UserInfo } from '../../models/userInfo.model';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatGateway {
  private socket;

  constructor(
    private authService:AuthService,
    private readonly userService:UserService,
    private readonly httpClient:HttpClient,
    ) {
    
    const jwt = this.authService.getToken();
    
    this.socket = io('/chat', { 
      path: '/socket.io/',
      auth:{token: jwt}
    });
  }

  muteUser(id: string, username: string) {
    this.socket.emit('MuteUser', { id, username });
  }

  unMuteUser(id: string, username: string) {
    this.socket.emit('UnMuteUser', { id, username });
  }

  changeUserStatus(channelId: string, username: string, status:string | null) {
    this.socket.emit('ChangeUserStatus', { channelId: channelId, username: username, status:status });
  }

  sendLastSeen(id: string, user: string) {
    this.socket.emit('LastSeen', { channelId: id, user: user });
  }

  deleteAllChannels() {
    this.socket.emit('DeleteAllChannels');
  }

  deleteChannel(id: string) {
    this.socket.emit('DeleteChannel', { channelId: id });
  }

  sendChannelMsg(message:string, channel:string) {
    this.socket.emit('ChannelMsg', { sender:this.userService.getUser(), channel:channel, message:message });
  }

  sendModChannelMsg(message:string, channel:string, username: string, status:string | null) {
    this.socket.emit('ChannelModMsg', { sender:this.userService.getUser(), channel:channel, message:message, username:username, status:status });
  }

  sendInviteMsg(channelId : string, username: string, mode: string) {
    this.socket.emit('InviteMsg', { channelId: channelId, sender:this.userService.getUser(), username:username, mode: mode });
  }

  createNewChannel(channelName:string, users:string[], creator:string, groupType:string, password:string) {
    this.socket.emit('CreateNewChannel', { channelName:channelName, users:users, creator:creator, groupType:groupType, password:password});
  }

  changePassword(id: string, password: string, channelType: string) {
    this.socket.emit('ChangePassword', { id, password, channelType });
  }

  gameAccepted(user: string, id :string, enemy: string, mode: string | undefined) {
    this.socket.emit('emitGameAccepted', { user, id, enemy, mode });
  }

  onCreatedNewPublicChannel() {
    return new Observable((observer) => {
      this.socket.on('CreatedNewPublicChannel', (data) => {
        observer.next(
          data.channel,
        );
      });
    });
  }

  onChannelId() {
    return new Observable((observer) => {
      this.socket.on('Channel', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  onMsgFromChannel() {
    return new Observable((observer) => {
      this.socket.on('MsgFromChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  onPrivateChat() {
    return new Observable((observer) => {
      this.socket.on('PrivateChat', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  onReceiveMsgForChannel() {
    return new Observable((observer) => {
      this.socket.on('ReceiveMsgForChannel', (data) => {
        observer.next(
          data
        );
      });
    });
  }

  onGameAccepted() {
    return new Observable((observer) => {
      this.socket.on('GameAccepted', (data) => {
        observer.next(
          data
        );
      });
    });
  }


  setOwner(id:string, username:string) {
    this.socket.emit('SetOwner', { id, username });
  }

  setAdmin(id:string, username:string) {
    this.socket.emit('SetAdmin', { id, username });
  }

  removeAdmin(id:string, username:string) {
    this.socket.emit('RemoveAdmin', { id, username });
  }

  addUserToChannel(channelId:string, username:string) {
    this.socket.emit('AddUserToChannel', { channelId, username});
  }

  getChannelById(id:string) {
    this.socket.emit('GetChannelById', { id });
  }

  getPrivateChat(userId: string, otherId: string) {
    this.socket.emit('GetPrivateChat', { userId, otherId });
  }

  receiveChannelMsg(id:string){
      this.socket.emit('ReceiveChMsg', { id });
  }

  reciveUserList(id:string){
    this.socket.emit('ReceiveUserList', { id });
  }

  receiveUserChannels(username:string){
    this.socket.emit('ReceiveUserChannels', { username });
  }

  onUserList(){
    return new Observable((observer) => {
      this.socket.on('UserList', (data) => {
        observer.next(data);
      });
    });
  }

  onUserChannelList(){
    return new Observable((observer) => {
      this.socket.on('UserChannelList', (data) => {
        observer.next(data);
      });
    });
  }

  onUserInfos(){
    return new Observable((observer) => {
      this.socket.on('UserInfos', (data) => {
        observer.next(data);
      });
    });
  }

  getChatOrCreate(user: string, otherusername: string, type: string): Promise<any> {
    return lastValueFrom(this.httpClient.get(`/nest/channels/getChatOrCreate/${user}`, {
      params: { user: user, otherusername: otherusername, type: type },
    }));
  }

  getChatByNames(user: string, otherusername: string, type: string): Promise<any> {
    return lastValueFrom(this.httpClient.get(`/nest/channels/getChat/${user}`, {
      params: { user: user, otherusername: otherusername, type: type },
    }));
  }

  getChannelByNameHttp(name: string): Promise<any> {
    return lastValueFrom(this.httpClient.get(`/nest/channels/getChannel/${name}`));
  }

  getChannelByIds(id: string): Observable<any> {
    return this.httpClient.get<any>(`/nest/channels/getChannelByIds/${id}`);
  }

  getTypesOfRealation (channelId : string, username: string) : Observable<any> {
    return this.httpClient.get<any>(`/nest/channels/getTypesOfRealation/${channelId}`, {
      params: { username: username },
    });
  }

  getUserStatus(channelId: string, userId: string): Observable<any> {
    return this.httpClient.get<any>(`/nest/channels/getUserStaus/${channelId}`, {
      params: { userId: userId }
    });
  }

  getFullUsersListName(id: string): Observable<string[]> {
    return this.httpClient.get<string[]>(`/nest/channels/fullUsersList/${id}`);
  }

  getUserList(id: string): Observable<any> {
    return this.httpClient.get<any>(`/nest/channels/getUserList/${id}`);
  }

  getInChannelById(id: string, username:string) {
    return this.httpClient.get<any>(`/nest/channels/getInChannelById/${id}`, {
      params: { username: username },
    });
  }

  getPasswordChannel(id: string): Observable< { password: string, type: string } > {
    return this.httpClient.get<{ password: string, type: string }>(`/nest/channels/getPasswordChannel/${id}`);
  }
  
  getMessagesPenidng(empty: null): Observable<any> {
    return this.httpClient.get<any>(`/nest/channels/getMessagesPenidng/${empty}`);
  }

  postChangeGameStatus(gameId: number, status: string, msgId: number) {
    //console.log('Before HTTP PATCH request');
    return this.httpClient.patch(`/nest/channels/changeGameStatus/${gameId}`, {status :{status: status, msgId: msgId}})
      .subscribe(
        (response) => {
          //console.log('HTTP PATCH successful:', response);
        },
        (error) => {
          console.error('HTTP PATCH error:', error);
        }
      );
    //console.log('After HTTP PATCH request');
  }

  //fuori scoop poi lo metton nel file giusto
  getUser(user: string): Observable<UserInfo> {
    return this.httpClient.get<UserInfo>(`/nest/channels/user/${user}`);
  }
}
