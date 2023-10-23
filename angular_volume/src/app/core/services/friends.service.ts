import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

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
}
