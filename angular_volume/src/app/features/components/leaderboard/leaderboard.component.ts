import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  players: any;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  async ngOnInit() {
    this.userService.patchNumberOfConnections('+');
    window.onbeforeunload = () => this.ngOnDestroy();
    this.players = (await this.userService.getAllUsers()).sort((a: any, b: any) => {
      const getWinRatio = (player: any): number => {
          return player.Wins / (player.Wins + player.Losses) || 0;
      };

      const aWinRatio = getWinRatio(a);
      const bWinRatio = getWinRatio(b);
      
      return bWinRatio - aWinRatio;
    });
  }

  openProfile(player: string) {
    this.router.navigate(['/transcendence/profile', player]);
  }

  ngOnDestroy() {
    this.userService.patchNumberOfConnections('-');
  }

}
