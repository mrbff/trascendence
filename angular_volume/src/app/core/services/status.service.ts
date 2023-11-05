import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(private readonly http: HttpClient) {}

  async setStatus(id: string, status: boolean) {
    return firstValueFrom(
      this.http.patch(`/nest/users/online/${id}`, { newStatus: status })
    );
  }

  async setPlaying(id: string, status: boolean) {
    return firstValueFrom(
      this.http.patch(`/nest/users/${id}`, { newStatus: status })
    );
  }

  async set2fa(id: string, status: boolean): Promise<any> {
    return firstValueFrom(
      this.http.patch(`/nest/users/2fa-status/${id}`, {
        newStatus: status,
      })
    );
  }
}
