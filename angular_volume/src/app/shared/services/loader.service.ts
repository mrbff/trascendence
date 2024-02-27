import { Injectable } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading: boolean;
  constructor(private readonly userService: UserService) {
    this.isLoading = false;
  }

  setStatus(status: boolean) {
    this.isLoading = status;
  }

  getStatus(): boolean {
    return this.isLoading;
  }
}
