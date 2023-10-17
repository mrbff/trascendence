import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  constructor(private readonly http: HttpClient) {}

  async setStatus(id: string, status: boolean) {
    this.http.patch(`/nest/users/online/${id}`, { newStatus: status });
  }

  async setPlaying(id: string, status: boolean) {
    this.http.patch(`/nest/users/${id}`, { newStatus: status });
  }
}
