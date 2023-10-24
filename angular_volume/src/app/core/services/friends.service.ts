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

  async addFriend(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/friends/invite/`, { friend: username })
    );
  }

  async getFriendRequests(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/friends/requests/received/`));
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
}
