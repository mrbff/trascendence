import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  constructor(private readonly http: HttpClient) {}

  async getFriendInfo(username: string): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/users/${username}`));
  }

  async getFriends(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/`));
  }

  async isFriend(friend: string): Promise<boolean> {
    const friends = await this.getFriends();
    for (let i = 0; i < friends.length; i++)
      if (friends[i].username === friend) return true;

    const friendsRequestSend = await this.getFriendRequestsSend();
    for (let i = 0; i < friendsRequestSend.length; i++)
      if (friendsRequestSend[i].username === friend) return true;

    const friendsRequestRecv = await this.getFriendRequestsRecv();
    for (let i = 0; i < friendsRequestRecv.length; i++)
      if (friendsRequestRecv[i].username === friend) return true;

    return false;
  }

  async addFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/invite/`, { friend: username })
    );
  }

  async getFriendRequestsRecv(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/requests/received/`));
  }

  async getFriendRequestsSend(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/requests/sent/`));
  }

  async acceptFriend(username: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`/nest/friends/accept/`, { friend: username })
    );
  }

  async deleteFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/delete/`, { friend: username })
    );
  }

  async rejectFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/reject/`, { friend: username })
    );
  }

  async blockUser(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/block/`, { to_block: username })
    );
  }

  async unblockUser(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/unblock/`, { to_unblock: username })
    );
  }

  async getBlockedUsers(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/blockeds/`));
  }

  async isBlocked(user: string): Promise<boolean> {
    const blockedUsers = await this.getBlockedUsers();
    for (let i = 0; i < blockedUsers.length; i++)
      if (blockedUsers[i].username === user) return true;
    return false;
  }
}
