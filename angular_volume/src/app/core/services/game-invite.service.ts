import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UserInfo } from 'src/app/models/userInfo.model';

@Injectable({
  providedIn: 'root',
})
export class InvitesService {
  constructor(private readonly http: HttpClient) {}

  async getInvites(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/invites/`));
  }

  async invite(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/invites/invite/`, { friend: username })
    );
  }

  async getInvitesRecv(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/invites/requests/received/`));
  }

  async getInviteSent(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/invites/requests/sent/`));
  }

  async acceptInvite(username: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(`/nest/invites/accept/`, { friend: username })
    );
  }

  async deleteInvite(username: string): Promise<any> {
    return lastValueFrom(
      this.http.post(`/nest/invites/delete/`, { friend: username })
    );
  }

  async getBlockedUsers(): Promise<any> {
    return lastValueFrom(this.http.get(`/nest/invites/blockeds/`));
  }

  async isBlocked(user: string): Promise<boolean> {
    const blockedUsers = await this.getBlockedUsers();
    return blockedUsers.some((f: any) => f.username === user);
  }
}
